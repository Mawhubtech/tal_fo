// This is an example showing how to use i18n translations in your components

import React from 'react';
import { useTranslation } from 'react-i18next';

const ExampleComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Using translations */}
      <h1>{t('admin.title')}</h1>
      <p>{t('admin.overview')}</p>
      
      {/* Translation with interpolation (if needed) */}
      <button>{t('common.save')}</button>
      <button>{t('common.cancel')}</button>
      
      {/* Navigation labels */}
      <nav>
        <a href="/dashboard">{t('nav.dashboard')}</a>
        <a href="/users">{t('nav.users')}</a>
      </nav>
    </div>
  );
};

export default ExampleComponent;

/*
  How to add new translations:
  
  1. Add the key-value pair to src/i18n/locales/en.json:
     {
       "mySection": {
         "myKey": "My English Text"
       }
     }
  
  2. Add the translation to src/i18n/locales/ar.json:
     {
       "mySection": {
         "myKey": "النص بالعربية"
       }
     }
  
  3. Use it in your component:
     {t('mySection.myKey')}
*/
