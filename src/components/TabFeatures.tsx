import React, { useState } from 'react';
import { Search, LineChart, Mail, Bot } from 'lucide-react';
import Button from './Button';

interface TabContentProps {
  title: string;
  description: string;
  content: React.ReactNode;
}

const TabFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'search',
      label: 'Search',
      fullLabel: 'Search (PeopleGPT)',
      icon: Search,
    },
    {
      id: 'insights',
      label: 'Talent Insights',
      fullLabel: 'Talent Insights',
      icon: LineChart,
    },
    {
      id: 'outreach',
      label: 'Email Outreach',
      fullLabel: 'Email Outreach',
      icon: Mail,
    },
    {
      id: 'agents',
      label: 'TalGPT Agents',
      fullLabel: 'TalGPT Agents',
      icon: Bot,
    },
  ];

  const tabContent: TabContentProps[] = [
    {
      title: 'Discover talent through AI-powered search',
      description: 'Elevate your recruitment strategy with PeopleGPT, the AI-powered search platform that transforms how you find talent. Streamline your search with semantic natural language queries – no need for complicated boolean strings.',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-sm">
                Searching for a <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">ML Engineer +7</span> in the
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mx-1">United States</span> who currently works or used to work at
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded mx-1">Stripe, Databricks or +15</span> companies and
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded mx-1">1 more filter</span>
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100" 
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">Kayla Victoria</h3>
                  <p className="text-sm text-gray-600">AI/ML Developer</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>kayla.victoria@gmail.com</span>
                    <span>Atlanta, GA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Make data-driven hiring decisions',
      description: 'Get real-time insights into talent pools, compensation trends, and skill availability. Our AI analyzes millions of data points to help you make informed decisions about your hiring strategy.',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Available Candidates', value: '2,547', trend: '+15%' },
                { label: 'Avg. Experience', value: '5.2 yrs', trend: '+2%' },
                { label: 'Avg. Salary Range', value: '$120-150k', trend: '+8%' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.trend} vs last month</p>
                </div>
              ))}
            </div>
            <div className="h-40 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Personalized email campaigns at scale',
      description: 'Engage candidates with AI-powered email sequences that feel personal and authentic. Our platform helps you craft the perfect message while maintaining your voice and brand.',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-600">to:</span>
                  <input
                    type="text"
                    value="kayla.victoria@gmail.com"
                    readOnly
                    className="bg-transparent w-full focus:outline-none text-gray-800"
                  />
                </div>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-sm">Hi Kayla,</p>
              <p className="text-sm mt-2">
                I noticed your impressive work with machine learning models at Databricks. We're building something exciting in the AI space and your expertise would be invaluable.
              </p>
              <p className="text-sm mt-2">Would you be open to a quick chat about opportunities at TalGPT?</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Your 24/7 AI recruiting assistant',
      description: 'Let our AI agents handle the routine tasks while you focus on building relationships. From initial outreach to interview scheduling, TalGPT Agents work tirelessly to accelerate your hiring process.',
      content: (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <div className="w-4 h-4 bg-white mask-hexagon"></div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <p className="text-sm">
                  I've reviewed 50 profiles matching your criteria and scheduled 5 initial conversations for next week. Here's a summary of the top candidates...
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100"></div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <p className="text-sm">
                  Great! Can you send me detailed profiles of the candidates and prepare personalized outreach messages?
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden px-4 sm:px-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-12">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-0">
            <div className="col-span-2 sm:hidden mb-4">
              <h3 className="text-lg font-semibold text-center">Features</h3>
            </div>
            <div className="col-span-2 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-0 sm:border-b sm:border-gray-200">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex flex-col sm:flex-row items-center gap-2 p-3 sm:py-4 sm:px-8 rounded-lg sm:rounded-none text-center transition-colors ${
                    activeTab === index
                      ? 'bg-black text-white sm:bg-transparent sm:border-b-2 sm:border-black sm:text-black'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 sm:bg-transparent sm:hover:bg-transparent sm:text-gray-500 sm:hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium text-sm sm:text-base">
                    {window.innerWidth < 640 ? tab.label : tab.fullLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto text-center space-y-6 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold">{tabContent[activeTab].title}</h2>
            <p className="text-base sm:text-lg text-gray-600">{tabContent[activeTab].description}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="primary" size="lg">
                Try for free
              </Button>
              <Button variant="outline" size="lg">
                Request a demo →
              </Button>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            {tabContent[activeTab].content}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TabFeatures;