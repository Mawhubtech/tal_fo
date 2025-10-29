import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const isArabic = i18n.language === 'ar';

  return (
    <button
      onClick={toggleLanguage}
      className="relative inline-flex items-center justify-center w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      title={`Switch to ${isArabic ? 'English' : 'العربية'}`}
    >
      {/* Toggle Switch Background */}
      <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${
        isArabic 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
      }`} />
      
      {/* Toggle Switch Handle */}
      <div className={`relative w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
        isArabic ? 'translate-x-4' : '-translate-x-4'
      }`}>
        <Globe className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600" />
      </div>
      
      {/* Language Labels */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <span></span>
        <span className={`text-xs font-medium transition-colors duration-300 ${
          isArabic ? 'text-white' : 'text-white'
        }`}>
          {isArabic ? 'AR' : 'EN'}
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
