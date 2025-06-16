import React, { useState, useEffect } from 'react';
import { Search, LineChart, Users, ClipboardList, Mail, Bot } from 'lucide-react'; // Added Users, ClipboardList
import Button from './Button';

interface TabContentProps {
  title: string;
  description: string;
  content: React.ReactNode;
}

const TabFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
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

  const tabContent: TabContentProps[] = [
    {
      title: 'Discover & Understand Top Talent with AI',
      description: 'Leverage PeopleGPT for semantic natural language searches and dive deep with AI-driven resume analysis. Uncover ideal candidates and understand their potential faster than ever.',
      content: (
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h4 className="text-lg font-semibold text-purple-700 mb-2">Semantic Search</h4>
              <p className="text-sm text-gray-600 mb-3">Find talent by describing your ideal candidate in plain English. No complex booleans needed.</p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p className="text-sm leading-relaxed">
                  "Find a <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">senior product manager</span> in <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded mx-1">London</span> with experience in <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded mx-1">fintech and B2B SaaS</span>, who has worked at <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded mx-1">scale-ups</span>."
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-700 mb-2">AI Resume Analysis</h4>
              <p className="text-sm text-gray-600 mb-3">Our AI goes beyond keywords to understand skills, experience, and potential from resumes.</p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-3">
                  <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop&crop=faces" alt="Resume snippet" className="w-12 h-12 rounded-full object-cover"/>
                  <div>
                    <p className="font-medium text-slate-800">John Doe - Analyzed Profile</p>
                    <p className="text-xs text-slate-500">Top Skills: Python, AWS, Project Management</p>
                    <p className="text-xs text-green-600">Potential Match Score: 85%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Engage Candidates & Build Your Pipeline',
      description: 'Automate personalized email sequences that resonate. Manage all candidate interactions, track progress, and nurture your talent pipeline with our integrated CRM.',
      content: (
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div>
              <h4 className="text-lg font-semibold text-purple-700 mb-2">Smart Email Sequencing</h4>
              <p className="text-sm text-gray-600 mb-3">Craft and automate personalized email campaigns that get responses.</p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-2">
                <p className="text-xs text-slate-500">Sequence: "Senior Engineer Outreach - Q3"</p>
                <div className="p-2 bg-white rounded border border-slate-300">
                  <p className="text-sm font-medium">Step 1: Initial Contact (Day 1)</p>
                  <p className="text-xs text-slate-600 mt-1">"Hi {'{CandidateName}'}, saw your work on {'{Project}'}..."</p>
                </div>
                <div className="p-2 bg-white rounded border border-slate-300">
                  <p className="text-sm font-medium">Step 2: Follow-up (Day 3)</p>
                  <p className="text-xs text-slate-600 mt-1">"Just checking in on my previous email..."</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-700 mb-2">Integrated Candidate CRM</h4>
              <p className="text-sm text-gray-600 mb-3">Manage your talent pipeline and communications in one central hub.</p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <p className="font-medium text-sm">Jane Smith</p><span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Contacted</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <p className="font-medium text-sm">Robert Brown</p><span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Screening</span>
                  </div>
                   <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <p className="font-medium text-sm">Alice Green</p><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Interview Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
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

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How Tal Supercharges Your Recruitment
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Explore our core features designed to help you find, engage, and hire top talent efficiently.
          </p>
        </div>

        <div className="border-b border-gray-200 mb-6 sm:mb-8">
          <div className="-mb-px flex flex-wrap justify-center gap-2 sm:gap-0" aria-label="Tabs">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`
                  flex flex-col sm:flex-row items-center justify-center gap-2 
                  py-3 px-4 sm:py-4 sm:px-6 text-center 
                  transition-colors duration-150 ease-in-out focus:outline-none
                  font-medium text-sm sm:text-base rounded-md sm:rounded-none
                  ${
                    activeTab === index
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                      : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/50 border-b-2 border-transparent'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>{isMobile ? tab.label : tab.fullLabel}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">{tabContent[activeTab].title}</h3>
            <p className="mt-3 text-base sm:text-lg text-slate-600">{tabContent[activeTab].description}</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {tabContent[activeTab].content}
          </div>

          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Try Tal for free
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Request a demo →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabFeatures;