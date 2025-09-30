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
  return (
    <section className="relative overflow-hidden bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How TAL Supercharges Your Recruitment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All-in-one platform with AI-powered features for modern recruitment teams.
          </p>
        </div>

        {/* Bento Grid - All Features Displayed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Sourcing - Large Card (2 columns) */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI-Powered Sourcing</h3>
                <p className="text-gray-600">Semantic search and AI resume analysis</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h4 className="text-lg font-bold text-purple-700 mb-3">Semantic Search</h4>
                <p className="text-sm text-gray-600 mb-4">Find talent by describing your ideal candidate in plain English.</p>
                <div className="bg-white rounded-xl p-3 border border-purple-200 shadow-sm">
                  <p className="text-xs leading-relaxed">
                    "Find a <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded font-medium">senior PM</span> in <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-medium mx-1">London</span> with <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded font-medium">fintech experience</span>"
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-blue-700 mb-3">AI Resume Analysis</h4>
                <p className="text-sm text-gray-600 mb-4">Beyond keywords - understand true potential.</p>
                <div className="bg-white rounded-xl p-3 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop&crop=faces" alt="Profile" className="w-8 h-8 rounded-full object-cover"/>
                    <div>
                      <p className="font-semibold text-xs text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">Python, AWS, Leadership</p>
                      <p className="text-xs text-green-600 font-medium">Match Score: 85%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Sequencing */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Smart Email Sequencing</h3>
                <p className="text-sm text-gray-600">Personalized campaigns</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <div className="space-y-3">
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-medium text-green-800">Step 1: Initial Contact</p>
                  <p className="text-xs text-green-600 mt-1">"Hi John, saw your work on..."</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-medium text-green-800">Step 2: Follow-up</p>
                  <p className="text-xs text-green-600 mt-1">"Just checking in..."</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600 font-medium">47% Response Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Pipeline */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Candidate Pipeline</h3>
                <p className="text-sm text-gray-600">CRM management</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="font-medium text-xs">Jane Smith</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Contacted</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="font-medium text-xs">Robert Brown</p>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Screening</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="font-medium text-xs">Alice Green</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Interview</span>
                </div>
              </div>
            </div>
          </div>

          {/* ATS Workflow - Medium Card (2 columns) */}
          <div className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">ATS Workflow</h3>
                <p className="text-sm text-gray-600">Hiring pipeline management</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {['Applied (12)', 'Screening (5)', 'Interview (3)', 'Offer (1)', 'Hired (0)'].map(stage => (
                  <div key={stage} className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                    <h5 className="text-xs font-semibold text-slate-700 mb-1.5 truncate">{stage.split(' (')[0]}</h5>
                    <p className="text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full inline-block mb-1.5 font-medium">{stage.match(/\((.*)\)/)?.[1]}</p>
                    <div className="space-y-1">
                      <div className="text-xs p-1 bg-slate-50 rounded text-slate-600 truncate">Candidate A</div>
                      <div className="text-xs p-1 bg-slate-50 rounded text-slate-600 truncate">Candidate B</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Talent Insights */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Talent Insights</h3>
                <p className="text-sm text-gray-600">Market analytics</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-gray-600 mb-1">Active Candidates</p>
                <p className="text-lg font-bold text-purple-700">3,200+</p>
                <p className="text-xs text-green-600">+12% growth</p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-gray-600 mb-1">Avg. Time to Hire</p>
                <p className="text-lg font-bold text-purple-700">32 days</p>
                <p className="text-xs text-green-600">-8% faster</p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-xs text-gray-600 mb-1">Top Skill Demand</p>
                <p className="text-lg font-bold text-purple-700">AI/ML</p>
                <p className="text-xs text-blue-600">High demand</p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl shadow-xl text-white p-6">
            <h3 className="text-lg font-bold mb-4">Performance Dashboard</h3>
            <div className="space-y-3">
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-purple-100 text-xs mb-1">Total Placements</p>
                <p className="text-xl font-bold">1,247</p>
                <p className="text-purple-200 text-xs">This quarter</p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-purple-100 text-xs mb-1">Success Rate</p>
                <p className="text-xl font-bold">89%</p>
                <p className="text-purple-200 text-xs">Above industry avg.</p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-3">
                <p className="text-purple-100 text-xs mb-1">Time Saved</p>
                <p className="text-xl font-bold">15hrs</p>
                <p className="text-purple-200 text-xs">Per placement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabFeatures;
