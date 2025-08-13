import React from 'react';
import Button from './Button';

const GlobalReach: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              800 Million Profiles
            </h2>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Global talent at your fingertips
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Start Searching
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              See Demo →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;