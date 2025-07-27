import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Users, 
  MessageCircle,
  Lightbulb,
  PlayCircle,
  BookOpen
} from 'lucide-react';

const ResourcesPage: React.FC = () => {
  const resources = [
    {
      category: "Getting Started",
      icon: <Lightbulb className="w-6 h-6" />,
      items: [
        {
          title: "Quick Start Guide",
          description: "Get up and running with TAL in minutes",
          type: "guide",
          icon: <BookOpen className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "Platform Overview",
          description: "Learn about TAL's core features and capabilities",
          type: "video",
          icon: <PlayCircle className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "User Setup Checklist",
          description: "Essential steps to configure your account",
          type: "checklist",
          icon: <FileText className="w-5 h-5" />,
          link: "#"
        }
      ]
    },
    {
      category: "User Guides",
      icon: <Book className="w-6 h-6" />,
      items: [
        {
          title: "Candidate Sourcing Guide",
          description: "Master the art of finding the right candidates",
          type: "guide",
          icon: <BookOpen className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "Job Management Best Practices",
          description: "Optimize your job posting and management workflow",
          type: "guide",
          icon: <BookOpen className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "Client Outreach Strategies",
          description: "Effective communication techniques for client engagement",
          type: "guide",
          icon: <BookOpen className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "Analytics and Reporting",
          description: "Understand your recruitment metrics and KPIs",
          type: "guide",
          icon: <BookOpen className="w-5 h-5" />,
          link: "#"
        }
      ]
    },
    {
      category: "Video Tutorials",
      icon: <Video className="w-6 h-6" />,
      items: [
        {
          title: "Creating Your First Job Posting",
          description: "Step-by-step video tutorial",
          type: "video",
          icon: <PlayCircle className="w-5 h-5" />,
          duration: "5 min",
          link: "#"
        },
        {
          title: "Setting Up Email Sequences",
          description: "Automate your candidate outreach",
          type: "video",
          icon: <PlayCircle className="w-5 h-5" />,
          duration: "8 min",
          link: "#"
        },
        {
          title: "Using the Chrome Extension",
          description: "Extract LinkedIn profiles efficiently",
          type: "video",
          icon: <PlayCircle className="w-5 h-5" />,
          duration: "6 min",
          link: "#"
        },
        {
          title: "Advanced Search Techniques",
          description: "Find candidates faster with Boolean search",
          type: "video",
          icon: <PlayCircle className="w-5 h-5" />,
          duration: "12 min",
          link: "#"
        }
      ]
    },
    {
      category: "Downloads",
      icon: <Download className="w-6 h-6" />,
      items: [
        {
          title: "TAL User Manual",
          description: "Complete platform documentation (PDF)",
          type: "pdf",
          icon: <FileText className="w-5 h-5" />,
          size: "2.4 MB",
          link: "#"
        },
        {
          title: "Chrome Extension",
          description: "LinkedIn profile extraction tool",
          type: "extension",
          icon: <Download className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "API Documentation",
          description: "Developer guide for TAL API integration",
          type: "api",
          icon: <FileText className="w-5 h-5" />,
          link: "#"
        },
        {
          title: "Email Templates Pack",
          description: "Ready-to-use recruitment email templates",
          type: "templates",
          icon: <Download className="w-5 h-5" />,
          size: "1.2 MB",
          link: "#"
        }
      ]
    }
  ];

  const communityResources = [
    {
      title: "User Community Forum",
      description: "Connect with other TAL users, share tips and get help",
      icon: <Users className="w-6 h-6" />,
      link: "#",
      external: true
    },
    {
      title: "Feature Requests",
      description: "Suggest new features and vote on upcoming enhancements",
      icon: <MessageCircle className="w-6 h-6" />,
      link: "#",
      external: true
    },
    {
      title: "Knowledge Base",
      description: "Searchable database of frequently asked questions",
      icon: <Book className="w-6 h-6" />,
      link: "#",
      external: true
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'guide': return 'bg-blue-100 text-blue-700';
      case 'pdf': return 'bg-green-100 text-green-700';
      case 'extension': return 'bg-purple-100 text-purple-700';
      case 'api': return 'bg-orange-100 text-orange-700';
      case 'templates': return 'bg-pink-100 text-pink-700';
      case 'checklist': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Resources & Documentation</h1>
        <p className="text-purple-100 text-lg">
          Everything you need to master TAL and optimize your recruitment process
        </p>
      </div>

      {/* Main Resources */}
      <div className="space-y-8">
        {resources.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="text-purple-600">
                  {category.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.category}
                </h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-gray-400 group-hover:text-purple-600 transition-colors mt-1">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {item.title}
                          </h3>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          {item.duration && (
                            <span className="text-xs text-gray-500">
                              {item.duration}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-xs text-gray-500">
                              {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Resources */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Community & Support
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communityResources.map((resource, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group text-center"
              >
                <div className="text-purple-600 group-hover:text-purple-700 transition-colors mb-3 flex justify-center">
                  {resource.icon}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors mb-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {resource.description}
                </p>
                {resource.external && (
                  <div className="mt-3 flex justify-center">
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Need Help Getting Started?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Schedule a Demo
          </button>
          <Link 
            to="/dashboard/contact-support"
            className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium text-center"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
