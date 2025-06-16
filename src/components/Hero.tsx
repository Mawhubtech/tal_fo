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
        <div className="text-center space-y-8 md:space-y-12 mb-16">
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
            Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">AI Co-Pilot</span> for<br />
            Smarter, Faster Hiring.
          </h1>
          
          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-700 delay-300 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            From intelligent sourcing and automated screening to personalized reachouts and a seamless ATS, 
            Tal revolutionizes your entire HR workflow. Hire the best, effortlessly.
          </p>
          
          {/* CTA buttons */}
          <div
            className={`flex flex-row items-center justify-center gap-4 pt-4 transition-all duration-700 delay-450 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } px-4 sm:px-0`}
          >
            <Button variant="primary" size="lg" className="flex-1 sm:flex-initial">
              Try for free
            </Button>
            <Button variant="outline" size="lg" icon={<Play className="w-4 h-4" />} className="flex-1 sm:flex-initial">
              Watch Tour
            </Button>
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