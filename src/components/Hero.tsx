import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from './Button';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const cyclingWords = [
    "Recruiters",
    "Job Seekers", 
    "TA Agencies",
    "HR Teams",
    "Leaders"
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % cyclingWords.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`transition-all duration-1000 delay-200 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight max-w-6xl mx-auto">
            <span className="whitespace-nowrap">Built for{' '}</span>
            <span className="relative inline-block whitespace-nowrap">
              <span 
                key={currentWordIndex}
                className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent animate-fadeInScale"
              >
                {cyclingWords[currentWordIndex]}
              </span>
            </span>
            <span className="italic text-gray-700 whitespace-nowrap"> everywhere</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            The AI-powered platform that transforms how you find, engage, and hire talent. 
            <span className="text-purple-600 font-semibold"> Connect with 800M+ professionals worldwide.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="primary" 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-base font-medium transition-colors"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="!bg-transparent !border-2 !border-gray-300 !text-gray-700 hover:!border-gray-400 hover:!text-gray-800 !bg-none rounded-full px-8 py-3 text-base font-medium transition-all duration-200"
            >
              Contact Sales
            </Button>
          </div>

          {/* Search Input Box */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative bg-white rounded-2xl shadow-lg border border-purple-200 p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Find AI Research Scientists in New York working at companies with 5,000 or more employees"
                    className="w-full text-lg text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
                  />
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Company Logos */}
          <div className="text-center">
            <div className="flex items-center justify-center flex-wrap gap-8 md:gap-12 opacity-60">
              <div className="text-xl md:text-2xl font-bold text-gray-400">American Express</div>
              <div className="text-xl md:text-2xl font-bold text-gray-400">Spotify</div>
              <div className="text-xl md:text-2xl font-bold text-gray-400">Palo Alto</div>
              <div className="text-xl md:text-2xl font-bold text-gray-400">Elastic</div>
              <div className="text-xl md:text-2xl font-bold text-gray-400">Autodesk</div>
              <div className="text-xl md:text-2xl font-bold text-gray-400">Amplitude</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.6s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default Hero;
