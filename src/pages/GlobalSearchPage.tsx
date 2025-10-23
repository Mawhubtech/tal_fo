import React, { useRef } from 'react';
import GlobalSearchComponent, { GlobalSearchRef } from '../components/GlobalSearchComponent';

const GlobalSearchPage: React.FC = () => {
  const searchRef = useRef<GlobalSearchRef>(null);

  return <GlobalSearchComponent ref={searchRef} />;
};

export default GlobalSearchPage;
