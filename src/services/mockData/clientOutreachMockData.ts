// Mock data for Client Outreach module
import { 
  ClientOutreachProject, 
  ClientOutreachSearch, 
  ClientProspect,
  ProjectListResponse 
} from '../clientOutreachProjectApiService';

// Mock Projects
export const mockProjects: ClientOutreachProject[] = [
  {
    id: 'proj-1',
    name: 'Enterprise SaaS Outreach Q4 2025',
    description: 'Targeting mid-to-large enterprises in the SaaS space for our AI consulting services',
    status: 'active',
    priority: 'high',
    visibility: 'team',
    objectives: {
      targetClients: 50,
      targetMeetings: 25,
      deadline: '2025-12-31',
      revenue: {
        target: 500000,
        currency: 'USD'
      },
      industries: ['SaaS', 'Technology', 'Financial Services'],
      companySize: ['201-500', '501-1000', '1000+'],
      location: ['United States', 'Canada', 'United Kingdom'],
      serviceOfferings: ['AI Consulting', 'Data Analytics', 'Machine Learning']
    },
    targets: {
      totalProspects: 200,
      totalSearches: 10,
      avgProspectsPerSearch: 20,
      expectedResponseRate: 15,
      expectedConversionRate: 5,
      expectedRevenue: 500000
    },
    progress: {
      totalProspects: 87,
      totalSearches: 4,
      totalSequences: 3,
      activeSequences: 2,
      completedSequences: 1,
      responseRate: 18.5,
      conversionRate: 6.2,
      meetingsScheduled: 8,
      dealsClosed: 2,
      actualRevenue: 75000
    },
    startDate: '2025-10-01',
    targetCompletionDate: '2025-12-31',
    createdById: 'user-1',
    assignedToTeamId: 'team-1',
    clientType: 'enterprise',
    tags: ['high-priority', 'q4-2025', 'enterprise'],
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-11-15T14:30:00Z',
    createdBy: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com'
    },
    assignedToTeam: {
      id: 'team-1',
      name: 'Enterprise Sales Team'
    }
  },
  {
    id: 'proj-2',
    name: 'SMB Tech Startup Outreach',
    description: 'Focusing on early-stage tech startups for our growth consulting services',
    status: 'active',
    priority: 'medium',
    visibility: 'public',
    objectives: {
      targetClients: 100,
      targetMeetings: 40,
      deadline: '2026-03-31',
      revenue: {
        target: 200000,
        currency: 'USD'
      },
      industries: ['Technology', 'FinTech', 'HealthTech'],
      companySize: ['1-10', '11-50', '51-200'],
      location: ['United States', 'Canada'],
      serviceOfferings: ['Growth Consulting', 'Product Strategy', 'Marketing Strategy']
    },
    targets: {
      totalProspects: 300,
      totalSearches: 15,
      avgProspectsPerSearch: 20,
      expectedResponseRate: 20,
      expectedConversionRate: 8,
      expectedRevenue: 200000
    },
    progress: {
      totalProspects: 145,
      totalSearches: 7,
      totalSequences: 5,
      activeSequences: 3,
      completedSequences: 2,
      responseRate: 22.1,
      conversionRate: 9.1,
      meetingsScheduled: 15,
      dealsClosed: 3,
      actualRevenue: 45000
    },
    startDate: '2025-11-01',
    targetCompletionDate: '2026-03-31',
    createdById: 'user-2',
    assignedToTeamId: 'team-2',
    clientType: 'startup',
    tags: ['smb', 'startups', 'growth'],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-20T16:45:00Z',
    createdBy: {
      id: 'user-2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com'
    },
    assignedToTeam: {
      id: 'team-2',
      name: 'SMB Sales Team'
    }
  },
  {
    id: 'proj-3',
    name: 'Healthcare Industry Initiative',
    description: 'Targeting healthcare organizations for digital transformation consulting',
    status: 'paused',
    priority: 'low',
    visibility: 'private',
    objectives: {
      targetClients: 30,
      targetMeetings: 15,
      deadline: '2026-06-30',
      revenue: {
        target: 300000,
        currency: 'USD'
      },
      industries: ['Healthcare', 'Medical Technology'],
      companySize: ['101-500', '501-1000'],
      location: ['United States'],
      serviceOfferings: ['Digital Transformation', 'Healthcare IT', 'Compliance Consulting']
    },
    targets: {
      totalProspects: 120,
      totalSearches: 6,
      avgProspectsPerSearch: 20,
      expectedResponseRate: 12,
      expectedConversionRate: 4,
      expectedRevenue: 300000
    },
    progress: {
      totalProspects: 35,
      totalSearches: 2,
      totalSequences: 1,
      activeSequences: 0,
      completedSequences: 1,
      responseRate: 8.5,
      conversionRate: 2.8,
      meetingsScheduled: 1,
      dealsClosed: 0,
      actualRevenue: 0
    },
    startDate: '2025-12-01',
    targetCompletionDate: '2026-06-30',
    createdById: 'user-3',
    clientType: 'mid-market',
    tags: ['healthcare', 'digital-transformation'],
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2025-12-15T11:20:00Z',
    createdBy: {
      id: 'user-3',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@company.com'
    }
  }
];

// Mock Searches
export const mockSearches: ClientOutreachSearch[] = [
  {
    id: 'search-1',
    projectId: 'proj-1',
    name: 'Large SaaS Companies - US',
    description: 'Targeting established SaaS companies with 500+ employees in the US market',
    status: 'active',
    searchCriteria: {
      industries: ['SaaS', 'Technology'],
      companySize: ['501-1000', '1000+'],
      location: ['United States'],
      revenue: {
        min: 10000000,
        max: 100000000,
        currency: 'USD'
      },
      employees: {
        min: 500,
        max: 5000
      },
      keywords: ['SaaS', 'software', 'enterprise'],
      technologies: ['AWS', 'Azure', 'React', 'Node.js'],
      fundingStage: ['Series C', 'Series D', 'IPO'],
      excludeCompanies: ['Microsoft', 'Google', 'Amazon']
    },
    results: {
      totalFound: 47,
      totalAdded: 42,
      lastRunAt: '2025-11-20T10:30:00Z',
      avgCompanyScore: 8.2,
      topIndustries: [
        { industry: 'SaaS', count: 28 },
        { industry: 'Enterprise Software', count: 14 }
      ],
      topLocations: [
        { location: 'California', count: 18 },
        { location: 'New York', count: 12 },
        { location: 'Texas', count: 8 }
      ]
    },
    automationSettings: {
      autoRun: true,
      frequency: 'weekly',
      maxResults: 50,
      qualityThreshold: 7.5
    },
    createdAt: '2025-10-15T09:00:00Z',
    updatedAt: '2025-11-20T10:30:00Z'
  },
  {
    id: 'search-2',
    projectId: 'proj-1',
    name: 'Financial Services - Canada',
    description: 'Canadian financial services companies looking for AI solutions',
    status: 'completed',
    searchCriteria: {
      industries: ['Financial Services', 'Banking', 'Insurance'],
      companySize: ['201-500', '501-1000'],
      location: ['Canada'],
      revenue: {
        min: 5000000,
        max: 50000000,
        currency: 'CAD'
      },
      keywords: ['fintech', 'banking', 'financial technology'],
      technologies: ['AI', 'machine learning', 'blockchain']
    },
    results: {
      totalFound: 23,
      totalAdded: 19,
      lastRunAt: '2025-11-10T14:15:00Z',
      avgCompanyScore: 7.8,
      topIndustries: [
        { industry: 'Banking', count: 12 },
        { industry: 'Insurance', count: 7 }
      ],
      topLocations: [
        { location: 'Toronto', count: 9 },
        { location: 'Vancouver', count: 6 },
        { location: 'Montreal', count: 4 }
      ]
    },
    createdAt: '2025-11-01T11:00:00Z',
    updatedAt: '2025-11-10T14:15:00Z'
  },
  {
    id: 'search-3',
    projectId: 'proj-2',
    name: 'Early Stage Startups - Tech',
    description: 'Tech startups in Series A/B looking for growth consulting',
    status: 'active',
    searchCriteria: {
      industries: ['Technology', 'FinTech', 'HealthTech'],
      companySize: ['1-10', '11-50'],
      location: ['United States', 'Canada'],
      fundingStage: ['Seed', 'Series A', 'Series B'],
      keywords: ['startup', 'tech', 'growth'],
      technologies: ['React', 'Python', 'AI']
    },
    results: {
      totalFound: 156,
      totalAdded: 89,
      lastRunAt: '2025-11-18T16:45:00Z',
      avgCompanyScore: 6.9,
      topIndustries: [
        { industry: 'FinTech', count: 45 },
        { industry: 'HealthTech', count: 28 },
        { industry: 'EdTech', count: 16 }
      ],
      topLocations: [
        { location: 'San Francisco', count: 34 },
        { location: 'New York', count: 25 },
        { location: 'Austin', count: 18 }
      ]
    },
    automationSettings: {
      autoRun: true,
      frequency: 'daily',
      maxResults: 25,
      qualityThreshold: 6.5
    },
    createdAt: '2025-11-05T13:30:00Z',
    updatedAt: '2025-11-18T16:45:00Z'
  }
];

// Mock Prospects
export const mockProspects: ClientProspect[] = [
  {
    id: 'prospect-1',
    projectId: 'proj-1',
    searchId: 'search-1',
    companyName: 'TechFlow Solutions',
    companyDomain: 'techflow.com',
    industry: 'SaaS',
    companySize: '501-1000',
    location: 'San Francisco, CA',
    revenue: {
      amount: 25000000,
      currency: 'USD'
    },
    employees: 750,
    description: 'Leading provider of workflow automation software for enterprises',
    contactPerson: {
      name: 'Jennifer Martinez',
      title: 'VP of Business Development',
      email: 'j.martinez@techflow.com',
      phone: '+1-415-555-0123',
      linkedinUrl: 'https://linkedin.com/in/jennifer-martinez-techflow'
    },
    status: 'contacted',
    priority: 'high',
    score: 8.7,
    tags: ['enterprise', 'automation', 'high-potential'],
    notes: 'Very interested in AI integration. Scheduled follow-up call for next week.',
    lastContactDate: '2025-11-18',
    nextFollowUpDate: '2025-11-25',
    dealValue: {
      amount: 150000,
      currency: 'USD'
    },
    source: 'LinkedIn Search',
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-11-18T15:30:00Z'
  },
  {
    id: 'prospect-2',
    projectId: 'proj-1',
    searchId: 'search-1',
    companyName: 'DataSync Corp',
    companyDomain: 'datasync.io',
    industry: 'Enterprise Software',
    companySize: '201-500',
    location: 'Austin, TX',
    revenue: {
      amount: 15000000,
      currency: 'USD'
    },
    employees: 420,
    description: 'Data integration platform for large enterprises',
    contactPerson: {
      name: 'Robert Chen',
      title: 'Chief Technology Officer',
      email: 'r.chen@datasync.io',
      linkedinUrl: 'https://linkedin.com/in/robert-chen-datasync'
    },
    status: 'responded',
    priority: 'medium',
    score: 7.5,
    tags: ['data-integration', 'enterprise'],
    notes: 'Responded positively to initial outreach. Interested in data analytics consulting.',
    lastContactDate: '2025-11-15',
    nextFollowUpDate: '2025-11-22',
    dealValue: {
      amount: 100000,
      currency: 'USD'
    },
    source: 'Cold Email',
    createdAt: '2025-10-25T14:20:00Z',
    updatedAt: '2025-11-15T09:45:00Z'
  },
  {
    id: 'prospect-3',
    projectId: 'proj-1',
    searchId: 'search-2',
    companyName: 'Northern Financial Group',
    companyDomain: 'northernfg.ca',
    industry: 'Financial Services',
    companySize: '501-1000',
    location: 'Toronto, ON',
    revenue: {
      amount: 45000000,
      currency: 'CAD'
    },
    employees: 890,
    description: 'Regional investment management firm with focus on technology investments',
    contactPerson: {
      name: 'Amanda Foster',
      title: 'Director of Innovation',
      email: 'a.foster@northernfg.ca',
      phone: '+1-416-555-0789'
    },
    status: 'meeting-scheduled',
    priority: 'high',
    score: 9.1,
    tags: ['financial-services', 'innovation', 'meeting-scheduled'],
    notes: 'Meeting scheduled for Nov 28th to discuss AI implementation in investment analysis.',
    lastContactDate: '2025-11-12',
    nextFollowUpDate: '2025-11-28',
    dealValue: {
      amount: 200000,
      currency: 'CAD'
    },
    source: 'Referral',
    createdAt: '2025-11-05T11:15:00Z',
    updatedAt: '2025-11-12T16:20:00Z'
  },
  {
    id: 'prospect-4',
    projectId: 'proj-2',
    searchId: 'search-3',
    companyName: 'HealthTech Innovations',
    companyDomain: 'healthtechinno.com',
    industry: 'HealthTech',
    companySize: '11-50',
    location: 'Boston, MA',
    employees: 35,
    description: 'AI-powered healthcare analytics startup',
    contactPerson: {
      name: 'Dr. Sarah Williams',
      title: 'CEO & Founder',
      email: 's.williams@healthtechinno.com',
      linkedinUrl: 'https://linkedin.com/in/dr-sarah-williams-healthtech'
    },
    status: 'new',
    priority: 'medium',
    score: 6.8,
    tags: ['startup', 'healthcare', 'ai'],
    notes: 'Recently raised Series A. Good fit for growth consulting services.',
    source: 'Industry Database',
    createdAt: '2025-11-15T13:40:00Z',
    updatedAt: '2025-11-15T13:40:00Z'
  },
  {
    id: 'prospect-5',
    projectId: 'proj-2',
    searchId: 'search-3',
    companyName: 'GreenFinance Solutions',
    companyDomain: 'greenfinance.io',
    industry: 'FinTech',
    companySize: '51-200',
    location: 'Denver, CO',
    revenue: {
      amount: 8000000,
      currency: 'USD'
    },
    employees: 125,
    description: 'Sustainable finance platform for SMB lending',
    contactPerson: {
      name: 'Mark Thompson',
      title: 'VP of Growth',
      email: 'm.thompson@greenfinance.io',
      phone: '+1-303-555-0456'
    },
    status: 'proposal-sent',
    priority: 'high',
    score: 8.3,
    tags: ['fintech', 'sustainability', 'proposal-sent'],
    notes: 'Proposal sent for comprehensive growth strategy engagement. Awaiting response.',
    lastContactDate: '2025-11-10',
    nextFollowUpDate: '2025-11-24',
    dealValue: {
      amount: 75000,
      currency: 'USD'
    },
    source: 'LinkedIn Outreach',
    createdAt: '2025-11-01T09:30:00Z',
    updatedAt: '2025-11-10T14:15:00Z'
  }
];

// Mock Analytics Data
export const mockAnalytics = {
  'proj-1': {
    overview: {
      totalProspects: 87,
      totalSearches: 4,
      totalSequences: 3,
      responseRate: 18.5,
      conversionRate: 6.2,
      meetingsScheduled: 8,
      dealsClosed: 2,
      actualRevenue: 75000
    },
    trends: {
      prospectsOverTime: [
        { date: '2025-10-01', count: 0 },
        { date: '2025-10-15', count: 25 },
        { date: '2025-11-01', count: 45 },
        { date: '2025-11-15', count: 67 },
        { date: '2025-11-20', count: 87 }
      ],
      responseRateOverTime: [
        { date: '2025-10-15', rate: 12.0 },
        { date: '2025-11-01', rate: 15.5 },
        { date: '2025-11-15', rate: 17.2 },
        { date: '2025-11-20', rate: 18.5 }
      ],
      conversionRateOverTime: [
        { date: '2025-10-15', rate: 4.0 },
        { date: '2025-11-01', rate: 5.1 },
        { date: '2025-11-15', rate: 5.8 },
        { date: '2025-11-20', rate: 6.2 }
      ],
      revenueOverTime: [
        { date: '2025-10-15', amount: 0 },
        { date: '2025-11-01', amount: 25000 },
        { date: '2025-11-15', amount: 50000 },
        { date: '2025-11-20', amount: 75000 }
      ]
    },
    demographics: {
      byIndustry: [
        { industry: 'SaaS', count: 42, responseRate: 20.5 },
        { industry: 'Enterprise Software', count: 28, responseRate: 16.1 },
        { industry: 'Financial Services', count: 17, responseRate: 15.8 }
      ],
      byCompanySize: [
        { size: '501-1000', count: 35, responseRate: 19.2 },
        { size: '201-500', count: 30, responseRate: 17.8 },
        { size: '1000+', count: 22, responseRate: 18.9 }
      ],
      byLocation: [
        { location: 'California', count: 28, responseRate: 21.4 },
        { location: 'New York', count: 18, responseRate: 16.7 },
        { location: 'Texas', count: 15, responseRate: 18.2 },
        { location: 'Canada', count: 26, responseRate: 17.3 }
      ],
      byStatus: [
        { status: 'contacted', count: 32 },
        { status: 'responded', count: 16 },
        { status: 'meeting-scheduled', count: 8 },
        { status: 'proposal-sent', count: 5 },
        { status: 'new', count: 26 }
      ]
    },
    performance: {
      topPerformingSearches: [
        { searchId: 'search-1', name: 'Large SaaS Companies - US', responseRate: 21.3, conversions: 5 },
        { searchId: 'search-2', name: 'Financial Services - Canada', responseRate: 17.3, conversions: 3 }
      ],
      topPerformingSequences: [
        { sequenceId: 'seq-1', name: 'Enterprise SaaS Sequence', responseRate: 19.5, conversions: 4 },
        { sequenceId: 'seq-2', name: 'Financial Services Follow-up', responseRate: 16.2, conversions: 2 }
      ],
      bestDays: [
        { day: 'Tuesday', responseRate: 22.1 },
        { day: 'Wednesday', responseRate: 19.8 },
        { day: 'Thursday', responseRate: 18.5 }
      ],
      bestTimes: [
        { hour: 10, responseRate: 24.3 },
        { hour: 14, responseRate: 21.7 },
        { hour: 9, responseRate: 19.2 }
      ]
    }
  },
  'proj-2': {
    overview: {
      totalProspects: 145,
      totalSearches: 7,
      totalSequences: 5,
      responseRate: 22.1,
      conversionRate: 9.1,
      meetingsScheduled: 15,
      dealsClosed: 3,
      actualRevenue: 45000
    },
    trends: {
      prospectsOverTime: [
        { date: '2025-11-01', count: 0 },
        { date: '2025-11-07', count: 32 },
        { date: '2025-11-14', count: 78 },
        { date: '2025-11-20', count: 145 }
      ],
      responseRateOverTime: [
        { date: '2025-11-07', rate: 18.0 },
        { date: '2025-11-14', rate: 20.5 },
        { date: '2025-11-20', rate: 22.1 }
      ],
      conversionRateOverTime: [
        { date: '2025-11-07', rate: 6.0 },
        { date: '2025-11-14', rate: 8.1 },
        { date: '2025-11-20', rate: 9.1 }
      ],
      revenueOverTime: [
        { date: '2025-11-07', amount: 0 },
        { date: '2025-11-14', amount: 20000 },
        { date: '2025-11-20', amount: 45000 }
      ]
    },
    demographics: {
      byIndustry: [
        { industry: 'FinTech', count: 65, responseRate: 24.2 },
        { industry: 'HealthTech', count: 45, responseRate: 21.1 },
        { industry: 'EdTech', count: 35, responseRate: 19.4 }
      ],
      byCompanySize: [
        { size: '11-50', count: 78, responseRate: 23.1 },
        { size: '51-200', count: 45, responseRate: 21.3 },
        { size: '1-10', count: 22, responseRate: 20.5 }
      ],
      byLocation: [
        { location: 'California', count: 58, responseRate: 23.4 },
        { location: 'New York', count: 35, responseRate: 21.7 },
        { location: 'Texas', count: 28, responseRate: 20.9 },
        { location: 'Canada', count: 24, responseRate: 22.1 }
      ],
      byStatus: [
        { status: 'new', count: 45 },
        { status: 'contacted', count: 52 },
        { status: 'responded', count: 28 },
        { status: 'meeting-scheduled', count: 15 },
        { status: 'proposal-sent', count: 5 }
      ]
    },
    performance: {
      topPerformingSearches: [
        { searchId: 'search-3', name: 'Early Stage Startups - Tech', responseRate: 24.1, conversions: 8 }
      ],
      topPerformingSequences: [
        { sequenceId: 'seq-3', name: 'Startup Growth Sequence', responseRate: 25.3, conversions: 6 }
      ],
      bestDays: [
        { day: 'Tuesday', responseRate: 25.1 },
        { day: 'Wednesday', responseRate: 22.8 },
        { day: 'Thursday', responseRate: 21.5 }
      ],
      bestTimes: [
        { hour: 11, responseRate: 26.3 },
        { hour: 15, responseRate: 23.7 },
        { hour: 10, responseRate: 21.2 }
      ]
    }
  }
};

// Helper functions for mock data
export const getProjectById = (id: string): ClientOutreachProject | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getSearchesByProjectId = (projectId: string): ClientOutreachSearch[] => {
  return mockSearches.filter(search => search.projectId === projectId);
};

export const getProspectsByProjectId = (projectId: string): ClientProspect[] => {
  return mockProspects.filter(prospect => prospect.projectId === projectId);
};

export const getSearchById = (id: string): ClientOutreachSearch | undefined => {
  return mockSearches.find(search => search.id === id);
};

export const getProspectById = (id: string): ClientProspect | undefined => {
  return mockProspects.find(prospect => prospect.id === id);
};

export const getAnalyticsByProjectId = (projectId: string) => {
  return mockAnalytics[projectId as keyof typeof mockAnalytics] || null;
};

// Simulate API delays
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
