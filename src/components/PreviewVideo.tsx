import React from 'react';
import { Play } from 'lucide-react';

const PREVIEW_IMAGE = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1920";

const PreviewVideo: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="absolute inset-0 bg-grid-lines opacity-5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="relative aspect-[16/9] max-w-5xl mx-auto rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Blurred background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
            style={{ backgroundImage: `url(${PREVIEW_IMAGE})` }}
          />
          
          {/* Sharp preview image */}
          <img
            src={PREVIEW_IMAGE}
            alt="Platform Preview"
            className="relative z-10 w-full h-full object-contain"
          />
          
          {/* Play button with pulse animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/30 rounded-full animate-ping"></div>
              <button className="relative z-20 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center group transition-transform hover:scale-110">
                <Play className="w-8 h-8 text-black fill-current" />
              </button>
            </div>
          </div>
          
          {/* Overlay to prevent interaction */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
};

export default PreviewVideo;