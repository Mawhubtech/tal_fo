import React, { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

/**
 * MobileExperienceBanner Component
 * 
 * Displays a dismissible banner to authenticated users on smaller devices (≤1000px)
 * informing them that the experience will be better on larger screens.
 * The dismissal state is persisted in localStorage.
 */
const MobileExperienceBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const STORAGE_KEY = 'tal_mobile_banner_dismissed';

  useEffect(() => {
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    
    // Check screen size
    const checkScreenSize = () => {
      const isSmallScreen = window.innerWidth <= 1000;
      setShouldShow(isSmallScreen && !isDismissed);
      setIsVisible(isSmallScreen && !isDismissed);
    };

    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!shouldShow || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-700 border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0 mt-0.5 sm:mt-0">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-white leading-tight">
                Better Experience on Desktop
              </p>
              <p className="text-xs sm:text-sm text-purple-100 mt-1 leading-tight">
                For the best experience, we recommend using TAL on a larger screen (desktop or tablet in landscape mode).
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Dismiss notification"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileExperienceBanner;
