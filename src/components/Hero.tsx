import React, { useEffect, useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import Button from './Button';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const cyclingWords = [
    "Talent Sourcing",
    "Smart Screening", 
    "AI Workflows",
    "Candidate Outreach",
    "Interview Scheduling",
    "Pipeline Management",
    "Team Collaboration",
    "Performance Analytics"
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % cyclingWords.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  return (
    <section className="relative overflow-hidden min-h-screen flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating shapes - opacity set to 100% */}
        <div className="absolute top-1/4 -left-56 w-[32rem] h-[32rem] bg-purple-100 rounded-full mix-blend-multiply filter blur-lg opacity-100 animate-blob"></div> {/* Opacity to 100% */}
        <div className="absolute bottom-1/4 -right-56 w-[30rem] h-[30rem] bg-pink-100 rounded-full mix-blend-multiply filter blur-lg opacity-100 animate-blob animation-delay-2000"></div> {/* Opacity to 100% */}
        <div className="absolute top-1/2 -left-40 transform -translate-y-1/2 w-[28rem] h-[28rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-lg opacity-100 animate-blob animation-delay-4000"></div> {/* Opacity to 100% */}
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] bg-indigo-100 rounded-full mix-blend-multiply filter blur-lg opacity-100 animate-blob animation-delay-6000"></div> {/* Opacity to 100% */}
        
        {/* Floating particles - adjusted positions */}
        <div className="absolute top-32 left-32 w-2 h-2 bg-purple-300 rounded-full animate-ping animation-delay-1000 opacity-20"></div>
        <div className="absolute top-48 right-48 w-1 h-1 bg-pink-300 rounded-full animate-ping animation-delay-3000 opacity-30"></div>
        <div className="absolute bottom-48 left-24 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping animation-delay-5000 opacity-25"></div>
        <div className="absolute bottom-64 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-2000 opacity-20"></div>
        <div className="absolute top-64 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-ping animation-delay-7000 opacity-25"></div>
      </div>

      {/* Main Content - moved up */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 lg:pt-16 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-16 md:space-y-20 mb-16">
          {/* Headline */}
          <div>
            <h1 
              className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight transition-all duration-700 delay-150 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Where Talent Meets<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">Opportunity</span>
            </h1>
            
            {/* Target Audience Cards */}
            <div 
              className={`mt-12 transition-all duration-700 delay-200 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="relative max-w-5xl mx-auto">
                {/* Connection Lines */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2"></div>
                
                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  {/* Recruiters Card */}
                  <div className="group relative">
                    <div className="relative bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                      {/* Connection dot */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-sm"></div>
                      
                      <div className="text-center pt-4">
                        <div className="text-2xl font-bold text-purple-600 mb-2">
                          Recruiters
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          AI-powered sourcing and intelligent candidate matching
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Seekers Card - Elevated */}
                  <div className="group relative md:-mt-4">
                    <div className="relative bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                      {/* Connection dot */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white shadow-sm"></div>
                      
                      <div className="text-center pt-4">
                        <div className="text-3xl font-bold text-pink-600 mb-3">
                          Job Seekers
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          Discover opportunities that align with your ambitions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TA Agencies Card */}
                  <div className="group relative">
                    <div className="relative bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                      {/* Connection dot */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-sm"></div>
                      
                      <div className="text-center pt-4">
                        <div className="text-2xl font-bold text-indigo-600 mb-2">
                          TA Agencies
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Streamline operations with precision and excellence
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cycling Text Animation at Bottom */}
      <div className="relative pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`text-2xl md:text-3xl lg:text-4xl font-medium text-gray-700 transition-all duration-700 delay-600 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <span className="text-gray-800">We take care of </span>
              <span className="inline-block min-w-[280px] md:min-w-[320px] text-center md:text-left"> {/* Changed text-left to text-center md:text-left */}
                <span 
                  key={currentWordIndex}
                  className="text-purple-600 font-semibold animate-fadeInUp"
                >
                  {cyclingWords[currentWordIndex]}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 8s infinite;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .animation-delay-8000 {
          animation-delay: 8s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        .animation-delay-7000 {
          animation-delay: 7s;
        }
      `}</style>
    </section>
  );
};

export default Hero;