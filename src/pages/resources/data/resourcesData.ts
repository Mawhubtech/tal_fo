import { 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Download, 
  Users, 
  MessageCircle,
  Lightbulb,
  Target,
  Briefcase,
  Building,
  Mail,
  Shield,
  BarChart3,
  Search,
  UserPlus,
  Settings,
  Chrome,
  Database,
  Zap,
  Filter,
  MessageSquare,
  Workflow,
  TrendingUp
} from 'lucide-react';

export interface ResourceItem {
  title: string;
  description: string;
  type: string;
  icon: any;
  link?: string;
  duration?: string;
  size?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
}

export interface ResourceCategory {
  category: string;
  icon: any;
  description: string;
  items: ResourceItem[];
}

export interface CommunityResource {
  title: string;
  description: string;
  icon: any;
  link: string;
  external: boolean;
}

export const resourcesData: ResourceCategory[] = [
  {
    category: "Getting Started",
    icon: Lightbulb,
    description: "Essential guides to get you up and running with TAL quickly",
    items: [
      {
        title: "Quick Start Guide",
        description: "Get up and running with TAL in just 15 minutes - complete setup walkthrough",
        type: "guide",
        icon: BookOpen,
        link: "#quick-start-guide",
        duration: "15 min read",
        difficulty: "Beginner",
        tags: ["quickstart", "setup", "tutorial", "beginner"]
      },
      {
        title: "Platform Overview",
        description: "Complete introduction to TAL's recruitment platform and core features",
        type: "guide",
        icon: BookOpen,
        link: "#platform-overview",
        duration: "10 min read",
        difficulty: "Beginner",
        tags: ["overview", "introduction", "basics", "features"]
      },
      {
        title: "Setup Checklist",
        description: "Interactive checklist to ensure complete account configuration",
        type: "checklist",
        icon: FileText,
        link: "#setup-checklist",
        duration: "20 min",
        difficulty: "Beginner",
        tags: ["checklist", "setup", "configuration", "account"]
      },
      {
        title: "Video Tutorial Series",
        description: "Watch comprehensive video tutorials covering all major features",
        type: "video",
        icon: PlayCircle,
        link: "#video-tutorials",
        duration: "45 min total",
        difficulty: "Beginner",
        tags: ["video", "tutorial", "comprehensive", "features"]
      },
      {
        title: "Navigation & Interface Guide",
        description: "Learn to navigate TAL's interface efficiently and understand the layout",
        type: "guide",
        icon: BookOpen,
        link: "#navigation-guide",
        duration: "8 min read",
        difficulty: "Beginner",
        tags: ["navigation", "interface", "basics", "ui"]
      }
    ]
  },
  {
    category: "Sourcing & Candidate Management",
    icon: Target,
    description: "Master candidate sourcing, management, and pipeline optimization",
    items: [
      {
        title: "Creating Sourcing Projects",
        description: "Learn how to set up and manage sourcing projects for different roles",
        type: "guide",
        icon: BookOpen,
        link: "#sourcing-projects",
        duration: "12 min read",
        difficulty: "Intermediate",
        tags: ["sourcing", "projects", "candidates"]
      },
      {
        title: "Advanced Search Techniques",
        description: "Master Boolean search, filters, and advanced sourcing strategies",
        type: "video",
        icon: PlayCircle,
        link: "#advanced-search",
        duration: "20 min",
        difficulty: "Advanced",
        tags: ["search", "boolean", "filters", "advanced"]
      },
      {
        title: "Candidate Pipeline Management",
        description: "Effectively manage candidates through different stages of recruitment",
        type: "guide",
        icon: BookOpen,
        link: "#pipeline-management",
        duration: "15 min read",
        difficulty: "Intermediate",
        tags: ["pipeline", "candidates", "stages"]
      },
      {
        title: "Using the Chrome Extension",
        description: "Extract LinkedIn profiles and import candidates seamlessly",
        type: "video",
        icon: PlayCircle,
        link: "#chrome-extension",
        duration: "8 min",
        difficulty: "Beginner",
        tags: ["chrome", "linkedin", "extension", "import"]
      },
      {
        title: "Candidate Profile Optimization",
        description: "Best practices for organizing and enriching candidate profiles",
        type: "guide",
        icon: BookOpen,
        link: "#profile-optimization",
        duration: "10 min read",
        difficulty: "Intermediate",
        tags: ["profiles", "organization", "enrichment"]
      }
    ]
  },
  {
    category: "Job & Organization Management",
    icon: Briefcase,
    description: "Comprehensive guides for managing jobs, clients, and organizational structures",
    items: [
      {
        title: "Creating and Managing Jobs",
        description: "Complete guide to job creation, requirements, and lifecycle management",
        type: "guide",
        icon: BookOpen,
        link: "#job-management",
        duration: "18 min read",
        difficulty: "Intermediate",
        tags: ["jobs", "creation", "management", "lifecycle"]
      },
      {
        title: "Organization Structure Setup",
        description: "How to configure clients, departments, and hierarchical structures",
        type: "guide",
        icon: BookOpen,
        link: "#organization-setup",
        duration: "15 min read",
        difficulty: "Intermediate",
        tags: ["organizations", "structure", "departments", "clients"]
      },
      {
        title: "Job Board Integrations",
        description: "Connect and manage multiple job boards for automated posting",
        type: "video",
        icon: PlayCircle,
        link: "#job-boards",
        duration: "12 min",
        difficulty: "Advanced",
        tags: ["job-boards", "integration", "automation", "posting"]
      },
      {
        title: "ATS Pipeline Configuration",
        description: "Set up and customize your Applicant Tracking System workflows",
        type: "guide",
        icon: BookOpen,
        link: "#ats-configuration",
        duration: "20 min read",
        difficulty: "Advanced",
        tags: ["ats", "pipeline", "workflow", "configuration"]
      },
      {
        title: "Client Relationship Management",
        description: "Best practices for managing client relationships and communications",
        type: "guide",
        icon: BookOpen,
        link: "#client-management",
        duration: "14 min read",
        difficulty: "Intermediate",
        tags: ["clients", "relationships", "communication", "crm"]
      }
    ]
  },
  {
    category: "Communication & Outreach",
    icon: Mail,
    description: "Email sequences, client outreach, and communication strategies",
    items: [
      {
        title: "Setting Up Email Sequences",
        description: "Create automated email campaigns for candidate and client outreach",
        type: "video",
        icon: PlayCircle,
        link: "#email-sequences",
        duration: "16 min",
        difficulty: "Intermediate",
        tags: ["email", "sequences", "automation", "outreach"]
      },
      {
        title: "Client Outreach Strategies",
        description: "Effective techniques for engaging prospects and maintaining relationships",
        type: "guide",
        icon: BookOpen,
        link: "#client-outreach",
        duration: "22 min read",
        difficulty: "Advanced",
        tags: ["outreach", "strategies", "prospects", "engagement"]
      },
      {
        title: "Email Template Library",
        description: "Pre-built templates for various recruitment scenarios and communications",
        type: "templates",
        icon: FileText,
        link: "#email-templates",
        size: "2.1 MB",
        difficulty: "Beginner",
        tags: ["templates", "email", "communication", "library"]
      },
      {
        title: "Personalization Best Practices",
        description: "How to personalize messages for better response rates",
        type: "guide",
        icon: BookOpen,
        link: "#personalization",
        duration: "12 min read",
        difficulty: "Intermediate",
        tags: ["personalization", "response-rates", "messaging"]
      },
      {
        title: "Communication Analytics",
        description: "Track and analyze your outreach performance and optimize campaigns",
        type: "guide",
        icon: BookOpen,
        link: "#communication-analytics",
        duration: "10 min read",
        difficulty: "Intermediate",
        tags: ["analytics", "performance", "optimization", "tracking"]
      }
    ]
  },
  {
    category: "Analytics & Reporting",
    icon: BarChart3,
    description: "Data insights, performance tracking, and reporting capabilities",
    items: [
      {
        title: "Dashboard Metrics Overview",
        description: "Understanding key performance indicators and dashboard analytics",
        type: "guide",
        icon: BookOpen,
        link: "#dashboard-metrics",
        duration: "14 min read",
        difficulty: "Beginner",
        tags: ["dashboard", "metrics", "kpi", "analytics"]
      },
      {
        title: "Recruitment Performance Analytics",
        description: "Deep dive into recruitment metrics, conversion rates, and success tracking",
        type: "video",
        icon: PlayCircle,
        link: "#performance-analytics",
        duration: "25 min",
        difficulty: "Advanced",
        tags: ["performance", "conversion", "success", "tracking"]
      },
      {
        title: "Custom Report Creation",
        description: "Build custom reports for stakeholders and performance reviews",
        type: "guide",
        icon: BookOpen,
        link: "#custom-reports",
        duration: "18 min read",
        difficulty: "Advanced",
        tags: ["reports", "custom", "stakeholders", "reviews"]
      },
      {
        title: "Data Export & Integration",
        description: "Export data and integrate with external analytics tools",
        type: "guide",
        icon: BookOpen,
        link: "#data-export",
        duration: "10 min read",
        difficulty: "Intermediate",
        tags: ["export", "integration", "external", "data"]
      }
    ]
  },
  {
    category: "Administration & Team Management",
    icon: Shield,
    description: "Platform administration, user management, and team collaboration",
    items: [
      {
        title: "User Management & Permissions",
        description: "Managing team members, roles, and access permissions",
        type: "guide",
        icon: BookOpen,
        link: "#user-management",
        duration: "16 min read",
        difficulty: "Advanced",
        tags: ["users", "permissions", "roles", "access"]
      },
      {
        title: "Team Collaboration Setup",
        description: "Configure hiring teams and collaborative workflows",
        type: "video",
        icon: PlayCircle,
        link: "#team-collaboration",
        duration: "14 min",
        difficulty: "Intermediate",
        tags: ["collaboration", "teams", "workflows", "hiring"]
      },
      {
        title: "System Settings & Configuration",
        description: "Platform settings, integrations, and system preferences",
        type: "guide",
        icon: BookOpen,
        link: "#system-settings",
        duration: "20 min read",
        difficulty: "Advanced",
        tags: ["settings", "configuration", "system", "preferences"]
      },
      {
        title: "Security & Compliance",
        description: "Data protection, security settings, and compliance guidelines",
        type: "guide",
        icon: BookOpen,
        link: "#security-compliance",
        duration: "12 min read",
        difficulty: "Advanced",
        tags: ["security", "compliance", "data-protection", "guidelines"]
      }
    ]
  },
  {
    category: "Advanced Features",
    icon: Zap,
    description: "Power user features and advanced platform capabilities",
    items: [
      {
        title: "API Integration Guide",
        description: "Connect TAL with external systems using our REST API",
        type: "guide",
        icon: BookOpen,
        link: "#api-integration",
        duration: "30 min read",
        difficulty: "Advanced",
        tags: ["api", "integration", "external", "systems"]
      },
      {
        title: "Workflow Automation",
        description: "Set up automated workflows and triggers for common tasks",
        type: "video",
        icon: PlayCircle,
        link: "#workflow-automation",
        duration: "22 min",
        difficulty: "Advanced",
        tags: ["automation", "workflows", "triggers", "tasks"]
      },
      {
        title: "Custom Pipeline Configuration",
        description: "Create custom recruitment pipelines for different job types",
        type: "guide",
        icon: BookOpen,
        link: "#custom-pipelines",
        duration: "25 min read",
        difficulty: "Advanced",
        tags: ["pipelines", "custom", "configuration", "job-types"]
      },
      {
        title: "Bulk Operations Guide",
        description: "Efficiently manage large datasets with bulk operations",
        type: "guide",
        icon: BookOpen,
        link: "#bulk-operations",
        duration: "15 min read",
        difficulty: "Intermediate",
        tags: ["bulk", "operations", "datasets", "efficiency"]
      }
    ]
  },
  {
    category: "Downloads & Tools",
    icon: Download,
    description: "Downloadable resources, tools, and extensions",
    items: [
      {
        title: "TAL User Manual",
        description: "Complete platform documentation in PDF format",
        type: "pdf",
        icon: FileText,
        link: "#user-manual",
        size: "4.2 MB",
        difficulty: "Beginner",
        tags: ["manual", "documentation", "pdf", "complete"]
      },
      {
        title: "Chrome Extension",
        description: "LinkedIn profile extraction tool for candidate sourcing",
        type: "extension",
        icon: Chrome,
        link: "#chrome-extension-download",
        size: "2.1 MB",
        difficulty: "Beginner",
        tags: ["chrome", "extension", "linkedin", "sourcing"]
      },
      {
        title: "Email Template Pack",
        description: "50+ ready-to-use recruitment email templates",
        type: "templates",
        icon: Download,
        link: "#email-template-pack",
        size: "1.8 MB",
        difficulty: "Beginner",
        tags: ["templates", "email", "recruitment", "ready-to-use"]
      },
      {
        title: "Job Description Templates",
        description: "Professional job description templates for various roles",
        type: "templates",
        icon: FileText,
        link: "#job-description-templates",
        size: "1.5 MB",
        difficulty: "Beginner",
        tags: ["job-descriptions", "templates", "roles", "professional"]
      },
      {
        title: "Candidate Evaluation Scorecards",
        description: "Structured scorecards for consistent candidate evaluation",
        type: "templates",
        icon: Download,
        link: "#evaluation-scorecards",
        size: "800 KB",
        difficulty: "Intermediate",
        tags: ["evaluation", "scorecards", "candidates", "assessment"]
      }
    ]
  }
];

export const communityResources: CommunityResource[] = [
  {
    title: "User Community Forum",
    description: "Connect with other TAL users, share best practices, and get help from the community",
    icon: Users,
    link: "#community-forum",
    external: true
  },
  {
    title: "Feature Requests & Feedback",
    description: "Suggest new features, vote on upcoming enhancements, and shape TAL's roadmap",
    icon: MessageCircle,
    link: "#feature-requests",
    external: true
  },
  {
    title: "Knowledge Base",
    description: "Searchable database of frequently asked questions and troubleshooting guides",
    icon: BookOpen,
    link: "#knowledge-base",
    external: true
  },
  {
    title: "Video Tutorial Library",
    description: "Access our complete library of video tutorials and webinar recordings",
    icon: PlayCircle,
    link: "#video-library",
    external: true
  },
  {
    title: "Best Practices Blog",
    description: "Read industry insights, recruitment tips, and platform optimization guides",
    icon: TrendingUp,
    link: "#best-practices-blog",
    external: true
  },
  {
    title: "Developer Documentation",
    description: "Technical documentation for API integration and custom development",
    icon: Database,
    link: "#developer-docs",
    external: true
  }
];

export const quickActions = [
  {
    title: "Schedule a Demo",
    description: "Get a personalized walkthrough of TAL's features",
    action: "demo",
    primary: true
  },
  {
    title: "Contact Support",
    description: "Get help from our expert support team",
    action: "support",
    primary: false
  },
  {
    title: "Join Community",
    description: "Connect with other recruitment professionals",
    action: "community",
    primary: false
  },
  {
    title: "Download Mobile App",
    description: "Access TAL on the go with our mobile application",
    action: "mobile",
    primary: false
  }
];

export const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'video': 'bg-red-100 text-red-700',
    'guide': 'bg-blue-100 text-blue-700',
    'pdf': 'bg-green-100 text-green-700',
    'extension': 'bg-purple-100 text-purple-700',
    'api': 'bg-orange-100 text-orange-700',
    'templates': 'bg-pink-100 text-pink-700',
    'checklist': 'bg-yellow-100 text-yellow-700',
    'tool': 'bg-indigo-100 text-indigo-700',
    'webinar': 'bg-teal-100 text-teal-700'
  };
  
  return colorMap[type] || 'bg-gray-100 text-gray-700';
};

export const getDifficultyColor = (difficulty: string): string => {
  const colorMap: Record<string, string> = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800'
  };
  
  return colorMap[difficulty] || 'bg-gray-100 text-gray-800';
};
