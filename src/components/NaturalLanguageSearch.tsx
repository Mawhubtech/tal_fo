import React from 'react';
import Button from './Button';

const NaturalLanguageSearch: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Find qualified talent using<br />natural language
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Search on TalGPT is powered by PeopleGPT, the world's first people search engine built on natural language. Describe who you're searching for, no Booleans needed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                Try for free
              </Button>
              <Button variant="outline" size="lg">
                Request a demo
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div>
                  <p className="text-sm text-gray-500">Just now</p>
                  <p className="font-medium">Hey TalGPT! Find senior engineers with experience building search infrastructure at top high-growth B2B software companies.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <div className="w-5 h-5 bg-white mask-hexagon"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Just now</p>
                  <p className="font-medium mb-3">Great! I've built an initial query, a starting point for your search. You can edit it, or run this query.</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm">
                      Searching for a <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Senior Engineer +7</span> in the
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mx-1">United States</span> who currently works or used to work at
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded mx-1">Elastic, Algolia or +15</span> companies and
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded mx-1">2 more filters</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NaturalLanguageSearch;