import React, { useState } from 'react';
import Button from './Button';
import ProfileSidePanel, { type PanelState } from '../pages/ProfileSidePanel';
import type { UserStructuredData } from '../pages/ProfilePage';

// Mock user data for demonstration
const mockUserData: UserStructuredData = {
  personalInfo: {
    fullName: "Sarah Johnson",
    location: "San Francisco, CA",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    linkedIn: "https://linkedin.com/in/sarahjohnson",
    github: "https://github.com/sarahjohnson"
  },
  summary: "Experienced full-stack developer with 5+ years building scalable web applications using React, Node.js, and cloud technologies. Passionate about creating user-friendly interfaces and optimizing system performance.",
  experience: [
    {
      position: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      startDate: "2022-01",
      endDate: undefined,
      description: "Lead development of customer-facing web applications",
      responsibilities: [
        "Architect and implement scalable React applications",
        "Mentor junior developers and conduct code reviews",
        "Collaborate with product teams on feature development"
      ],
      achievements: [
        "Improved application performance by 40%",
        "Led team of 4 developers on major product launch"
      ]
    },
    {
      position: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2020-03",
      endDate: "2022-01",
      description: "Full-stack development for early-stage startup",
      responsibilities: [
        "Built MVP from scratch using React and Node.js",
        "Implemented CI/CD pipelines and deployment automation"
      ],
      achievements: [
        "Delivered MVP 2 months ahead of schedule",
        "Reduced deployment time by 70%"
      ]
    }
  ],
  education: [
    {
      institution: "Stanford University",
      degree: "Bachelor of Science in Computer Science",
      major: "Computer Science",
      location: "Stanford, CA",
      startDate: "2016",
      endDate: "2020",
      graduationDate: "2020",
      description: "Focused on software engineering and human-computer interaction",
      courses: ["Data Structures", "Algorithms", "Software Engineering", "HCI"],
      honors: ["Dean's List", "Magna Cum Laude"]
    }
  ],
  skills: [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Docker", 
    "PostgreSQL", "GraphQL", "Jest", "Git", "Agile", "System Design"
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform with React, Node.js, and Stripe integration",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
      date: "2023",
      url: "https://github.com/sarahjohnson/ecommerce-platform"
    },
    {
      name: "Task Management App",
      description: "Mobile-first task management application with real-time collaboration",
      technologies: ["React Native", "Firebase", "TypeScript"],
      date: "2022",
      url: "https://github.com/sarahjohnson/task-manager"
    }
  ]
};

/**
 * Demo component showing how to use the three-state ProfileSidePanel
 * 
 * States:
 * - closed: Panel is completely hidden
 * - collapsed: Panel shows only a narrow sidebar with tabs
 * - expanded: Panel is fully open showing all content
 */
const ProfilePanelDemo: React.FC = () => {
  const [panelState, setPanelState] = useState<PanelState>('closed');
  const [selectedUser, setSelectedUser] = useState<UserStructuredData | null>(null);

  const handleOpenPanel = (state: PanelState = 'expanded') => {
    setSelectedUser(mockUserData);
    setPanelState(state);
  };

  const handleStateChange = (newState: PanelState) => {
    setPanelState(newState);
    if (newState === 'closed') {
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Three-State Profile Panel Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demo shows the three different states of the ProfileSidePanel component:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Closed</h3>
              <p className="text-sm text-gray-600 mb-3">Panel is completely hidden</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStateChange('closed')}
                className={panelState === 'closed' ? 'bg-green-50 border-green-500' : ''}
              >
                Close Panel
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Collapsed</h3>
              <p className="text-sm text-gray-600 mb-3">Shows narrow sidebar with tabs</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenPanel('collapsed')}
                className={panelState === 'collapsed' ? 'bg-green-50 border-green-500' : ''}
              >
                Collapse Panel
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Expanded</h3>
              <p className="text-sm text-gray-600 mb-3">Full panel with all content</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenPanel('expanded')}
                className={panelState === 'expanded' ? 'bg-green-50 border-green-500' : ''}
              >
                Expand Panel
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Current State: {panelState}</h4>
            <p className="text-sm text-blue-700">
              {panelState === 'closed' && "The panel is hidden. Click a button above to open it."}
              {panelState === 'collapsed' && "The panel is showing as a narrow sidebar. You can click on tabs to expand it."}
              {panelState === 'expanded' && "The panel is fully open. You can collapse it using the button in the panel header."}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Profile Card</h2>
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center text-purple-600 text-xl font-semibold">
                  SJ
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => handleOpenPanel('expanded')}
                  >
                    {mockUserData.personalInfo.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {mockUserData.experience?.[0]?.position} at {mockUserData.experience?.[0]?.company}
                  </p>
                  <p className="text-sm text-gray-500">{mockUserData.personalInfo.location}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenPanel('expanded')}
                >
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenPanel('collapsed')}
                >
                  Quick View
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-State Profile Panel */}
      <ProfileSidePanel
        userData={selectedUser}
        panelState={panelState}
        onStateChange={handleStateChange}
      />
    </div>
  );
};

export default ProfilePanelDemo;
