import React, { useEffect, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import Button from './Button';
import DemoPreview from './DemoPreview';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a small delay to trigger animation after component mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="text-center space-y-6 md:space-y-8">
          {/* New feature tag */}
          <div 
            className={`inline-flex transition-all duration-700 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm px-4 py-1.5 flex items-center">
              <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-0.5 rounded-full">New</span>
              <span className="ml-2 text-sm text-gray-600">Try Tal Agents, your 24/7 AI assistants</span>
              <span className="ml-1 text-gray-400">→</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight transition-all duration-700 delay-150 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            The <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">AI</span> Platform for<br />
            the Future
          </h1>
          
          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-300 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            TalGPT, the AI engine that understands what you're<br className="hidden md:block" /> 
            looking for. Discover and unlock intelligence at scale.
          </p>
          
          {/* CTA buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-700 delay-450 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } px-4 sm:px-0`}
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Try for free
            </Button>
            <Button variant="outline" size="lg" icon={<Play className="w-4 h-4" />} className="w-full sm:w-auto">
              Watch Tour
            </Button>
          </div>
        </div>
        
        {/* Platform preview */}
        <div 
          className={`mt-16 md:mt-20 transition-all duration-1000 delay-600 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } px-4 sm:px-0`}
        >
          <DemoPreview />
        </div>
      </div>
    </section>
  );
};

export default Hero;