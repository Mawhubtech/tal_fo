import React from 'react';
import { 
  Target, Briefcase, Users, Mail, BarChart3, Shield, 
  Chrome, Database, Workflow, Search, Building, UserPlus,
  MessageSquare, Settings, GitBranch, Download, Rocket,
  Compass, CheckSquare
} from 'lucide-react';

export interface FeatureGuide {
  title: string;
  description: string;
  icon: any;
  features: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  category: string;
}

export const featureGuides: FeatureGuide[] = [
  {
    title: "Quick Start Guide",
    description: "Get up and running with TAL in just 15 minutes - complete setup walkthrough",
    icon: Rocket,
    features: [
      "Complete account setup and profile configuration",
      "Create your first sourcing project",
      "Install and configure Chrome extension",
      "Import your first candidate and send outreach",
      "Set up your daily workflow dashboard"
    ],
    difficulty: "Beginner",
    estimatedTime: "15 minutes",
    category: "Getting Started"
  },
  {
    title: "Platform Overview",
    description: "Complete guide to understanding TAL's features and capabilities",
    icon: Compass,
    features: [
      "Core modules and feature overview",
      "Typical recruitment workflow",
      "AI-powered capabilities and automation",
      "Integration capabilities and security",
      "Help and support resources"
    ],
    difficulty: "Beginner",
    estimatedTime: "10 minutes",
    category: "Getting Started"
  },
  {
    title: "Setup Checklist",
    description: "Interactive checklist to ensure complete account configuration",
    icon: CheckSquare,
    features: [
      "Account basics and profile setup",
      "Team configuration and permissions",
      "Project and pipeline configuration",
      "Chrome extension installation",
      "Email setup and notification preferences"
    ],
    difficulty: "Beginner",
    estimatedTime: "20 minutes",
    category: "Getting Started"
  },
  {
    title: "Dashboard Overview",
    description: "Your central hub for recruitment metrics, quick actions, and platform navigation",
    icon: BarChart3,
    features: [
      "View key recruitment metrics and KPIs",
      "Access quick actions for common tasks",
      "Monitor recent activity and notifications",
      "Navigate to different platform sections"
    ],
    difficulty: "Beginner",
    estimatedTime: "5 minutes",
    category: "Getting Started"
  },
  {
    title: "Sourcing Projects",
    description: "Organize and manage candidate sourcing for different roles and clients",
    icon: Target,
    features: [
      "Create and manage sourcing projects",
      "Set up search parameters and criteria",
      "Track candidate progress through stages",
      "Collaborate with team members",
      "Generate sourcing reports and analytics"
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 minutes",
    category: "Sourcing"
  },
  {
    title: "Job Management",
    description: "Complete job lifecycle management through organizations and departments",
    icon: Briefcase,
    features: [
      "Create jobs within organizational structure",
      "Set up ATS pipelines and stages",
      "Manage candidate applications",
      "Configure hiring teams",
      "Track job performance metrics"
    ],
    difficulty: "Intermediate",
    estimatedTime: "20 minutes",
    category: "Job Management"
  },
  {
    title: "Candidate Management",
    description: "Comprehensive candidate profile management and tracking",
    icon: Users,
    features: [
      "Import candidates from multiple sources",
      "Manage candidate profiles and notes",
      "Track candidate interactions",
      "Move candidates through pipelines",
      "Schedule interviews and follow-ups"
    ],
    difficulty: "Intermediate",
    estimatedTime: "12 minutes",
    category: "Candidate Management"
  },
  {
    title: "Email Sequences & Outreach",
    description: "Automated communication workflows for candidates and clients",
    icon: Mail,
    features: [
      "Create multi-step email sequences",
      "Personalize messages with dynamic content",
      "Schedule and automate follow-ups",
      "Track open rates and responses",
      "A/B test different message variations"
    ],
    difficulty: "Advanced",
    estimatedTime: "25 minutes",
    category: "Communication"
  },
  {
    title: "Client Outreach",
    description: "Manage client relationships and business development activities",
    icon: Building,
    features: [
      "Track client interactions and touchpoints",
      "Manage prospect pipelines",
      "Schedule follow-up activities",
      "Generate client reports",
      "Monitor relationship health"
    ],
    difficulty: "Intermediate",
    estimatedTime: "18 minutes",
    category: "Client Management"
  },
  {
    title: "Chrome Extension",
    description: "Extract LinkedIn profiles and import candidates seamlessly",
    icon: Chrome,
    features: [
      "One-click LinkedIn profile extraction",
      "Automatic data parsing and formatting",
      "Direct import to TAL platform",
      "Bulk profile processing",
      "Data validation and enrichment"
    ],
    difficulty: "Beginner",
    estimatedTime: "8 minutes",
    category: "Tools"
  },
  {
    title: "Analytics & Reporting",
    description: "Comprehensive insights into recruitment performance and trends",
    icon: BarChart3,
    features: [
      "Track recruitment KPIs and metrics",
      "Generate custom reports",
      "Analyze conversion rates",
      "Monitor team performance",
      "Export data for external analysis"
    ],
    difficulty: "Advanced",
    estimatedTime: "30 minutes",
    category: "Analytics"
  },
  {
    title: "Team Management",
    description: "Manage users, roles, and collaborative workflows",
    icon: Shield,
    features: [
      "Create and manage user accounts",
      "Set up role-based permissions",
      "Configure hiring teams",
      "Monitor team activity",
      "Manage access controls"
    ],
    difficulty: "Advanced",
    estimatedTime: "22 minutes",
    category: "Administration"
  },
  {
    title: "Pipeline Configuration",
    description: "Customize recruitment workflows and automation rules",
    icon: GitBranch,
    features: [
      "Design custom pipeline stages",
      "Set up automation triggers",
      "Configure stage requirements",
      "Define approval workflows",
      "Monitor pipeline performance"
    ],
    difficulty: "Advanced",
    estimatedTime: "35 minutes",
    category: "Configuration"
  },
  {
    title: "Job Board Integrations",
    description: "Connect and manage multiple job board platforms",
    icon: Database,
    features: [
      "Configure job board connections",
      "Automate job posting workflows",
      "Sync applications and candidates",
      "Manage posting templates",
      "Track posting performance"
    ],
    difficulty: "Advanced",
    estimatedTime: "28 minutes",
    category: "Integrations"
  },
  {
    title: "Search & Filtering",
    description: "Advanced search capabilities across all platform data",
    icon: Search,
    features: [
      "Boolean search queries",
      "Advanced filtering options",
      "Saved search templates",
      "Search result exports",
      "Search performance analytics"
    ],
    difficulty: "Intermediate",
    estimatedTime: "15 minutes",
    category: "Search"
  }
];

interface FeatureGuideCardProps {
  guide: FeatureGuide;
  onLearnMore: (guide: FeatureGuide) => void;
}

const FeatureGuideCard: React.FC<FeatureGuideCardProps> = ({ guide, onLearnMore }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <guide.icon className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              {guide.title}
            </h3>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                {guide.difficulty}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {guide.description}
          </p>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
            <ul className="space-y-1">
              {guide.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
              {guide.features.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{guide.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              📖 {guide.estimatedTime} read
            </span>
            <button
              onClick={() => onLearnMore(guide)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGuideCard;
