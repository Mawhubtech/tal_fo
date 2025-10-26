import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const currentLanguage = i18n.language === 'ar' ? 'العربية' : 'English';
  const nextLanguage = i18n.language === 'ar' ? 'English' : 'العربية';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Switch to ${nextLanguage}`}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium text-sm">{currentLanguage}</span>
      <span className="text-xs text-gray-500">→ {nextLanguage}</span>
    </button>
  );
};

export default LanguageToggle;
