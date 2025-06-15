import React from 'react';
import Button from './Button';

const GlobalReach: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight px-4 sm:px-0">
            Global reach: 800 million profiles
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            With close to a billion records across the globe, TalGPT helps you fulfill any search,
            no matter how specific. And once you've found the perfect fit, TalGPT provides you
            with the contact information to get in touch right away.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 px-4 sm:px-0">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Try for free
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Request a demo →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalReach;