import React, { useState, useEffect } from 'react';
import { Search, LineChart, Users, ClipboardList, Mail } from 'lucide-react';

interface TabInfo {
  id: string;
  label: string; // Short label for mobile/tight spaces
  fullLabel: string; // Full label for desktop
  icon: React.ElementType;
}

interface TabContentItem {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

const tabsData: TabInfo[] = [
  {
    id: 'sourcing',
    label: 'AI Sourcing',
    fullLabel: 'AI-Powered Sourcing',
    icon: Search,
  },
  {
    id: 'outreach-crm',
    label: 'Outreach & CRM',
    fullLabel: 'Intelligent Outreach & CRM',
    icon: Users,
  },
  {
    id: 'ats',
    label: 'ATS Workflow',
    fullLabel: 'Streamlined Hiring Workflow (ATS)',
    icon: ClipboardList,
  },
  {
    id: 'insights',
    label: 'Talent Insights',
    fullLabel: 'Data-Driven Talent Insights',
    icon: LineChart,
  },
];

const tabContentData: TabContentItem[] = [
  {
    id: 'sourcing',
    title: 'Discover & Understand Top Talent with AI',
    description: 'Leverage PeopleGPT for semantic natural language searches and dive deep with AI-driven resume analysis. Uncover ideal candidates and understand their potential faster than ever.',
    content: (
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-purple-700">Semantic Search</h4>
            </div>
            <p className="text-gray-600 mb-4">Find talent by describing your ideal candidate in plain English.</p>
            <div className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm">
              <p className="text-sm leading-relaxed">
                "Find a <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">senior product manager</span> in <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium mx-1">London</span> with experience in <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium mx-1">fintech and B2B SaaS</span>"
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-blue-700">AI Resume Analysis</h4>
            </div>
            <p className="text-gray-600 mb-4">AI-powered insights beyond keywords to understand potential.</p>
            <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop&crop=faces" alt="Profile" className="w-12 h-12 rounded-full object-cover"/>
                <div>
                  <p className="font-semibold text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">Python, AWS, Leadership</p>
                  <p className="text-sm text-green-600 font-medium">Match Score: 85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'outreach-crm',
    title: 'Engage Candidates & Build Your Pipeline',
    description: 'Automate personalized email sequences that resonate. Manage all candidate interactions, track progress, and nurture your talent pipeline with our integrated CRM.',
    content: (
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-green-700">Smart Email Sequencing</h4>
            </div>
            <p className="text-gray-600 mb-4">Automate personalized campaigns that get responses.</p>
            <div className="bg-white rounded-xl p-4 border border-green-200 shadow-sm space-y-2">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Step 1: Initial Contact</p>
                <p className="text-xs text-green-600 mt-1">"Hi John, saw your work on..."</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Step 2: Follow-up</p>
                <p className="text-xs text-green-600 mt-1">"Just checking in..."</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-orange-700">Candidate Pipeline</h4>
            </div>
            <p className="text-gray-600 mb-4">Manage all interactions in one central hub.</p>
            <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                <p className="font-medium text-sm">Jane Smith</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Contacted</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                <p className="font-medium text-sm">Robert Brown</p>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Screening</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                <p className="font-medium text-sm">Alice Green</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Interview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ats',
    title: 'Optimize Your Hiring with an Intuitive ATS',
    description: 'From job posting to offer letter, manage your entire recruitment lifecycle efficiently. Our user-friendly Applicant Tracking System simplifies tasks and enhances team collaboration.',
    content: (
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h4 className="text-lg font-semibold text-purple-700 mb-1 text-center">Your Hiring Cockpit</h4>
        <p className="text-sm text-gray-600 mb-4 text-center">Visualize and manage every stage of your recruitment process.</p>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {['Applied (12)', 'Screening (5)', 'Interview (3)', 'Offer (1)', 'Hired (0)'].map(stage => (
              <div key={stage} className="min-w-[160px] flex-shrink-0 bg-white p-3 rounded-md shadow-md">
                <h5 className="text-sm font-medium text-slate-700 mb-1">{stage.split(' (')[0]}</h5>
                <p className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full inline-block">{stage.match(/\((.*)\)/)?.[1]} candidates</p>
                <div className="mt-2 space-y-1">
                  <div className="text-xs p-1.5 bg-slate-100 rounded">Candidate Alpha</div>
                  <div className="text-xs p-1.5 bg-slate-100 rounded">Candidate Beta</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'insights',
    title: 'Make Strategic Decisions with Talent Insights',
    description: 'Access real-time data on talent pools, compensation trends, and skill availability. Our AI analytics help you make informed, strategic hiring decisions.',
    content: (
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active Candidates in Market', value: '3,200+', trend: '+12%', color: 'text-green-600' },
              { label: 'Avg. Time to Hire', value: '32 days', trend: '-8%', color: 'text-green-600' },
              { label: 'Top Skill Demand: AI/ML', value: 'High', trend: 'Growing', color: 'text-blue-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-semibold mt-1 text-purple-700">{stat.value}</p>
                <p className={`text-sm ${stat.color} mt-0.5`}>{stat.trend}</p>
              </div>
            ))}
          </div>
          <div className="h-48 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
            <LineChart className="w-16 h-16 text-slate-300" />
            <p className="text-slate-400 ml-2">Market Trends Chart Placeholder</p>
          </div>
        </div>
      </div>
    ),
  },
];

const TabFeatures: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>(tabsData[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768); // md breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeContent = tabContentData.find(content => content.id === activeTabId) || tabContentData[0];

  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How TAL Supercharges Your Recruitment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our core features designed to help you find, engage, and hire top talent efficiently.
          </p>
        </div>

        <div className="md:flex md:gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          {!isMobile && (
            <nav className="md:w-1/3 lg:w-1/4 md:sticky md:top-28 self-start mb-10 md:mb-0">
              <ul className="space-y-3">
                {tabsData.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        setActiveTabId(tab.id);
                      }}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 ease-in-out
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 border
                        ${
                          activeTabId === tab.id
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-100 hover:border-gray-200'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-xl ${activeTabId === tab.id ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gray-100'}`}>
                        <tab.icon className={`w-5 h-5 ${activeTabId === tab.id ? 'text-purple-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="font-semibold text-base">{tab.fullLabel}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Content Area */}
          <main className={`md:w-2/3 lg:w-3/4 ${isMobile ? 'w-full' : ''} relative`}>
            <div className="max-w-5xl mx-auto">
              {activeContent.content}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
};

export default TabFeatures;