import React, { ReactNode, createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    console.error('TabsTrigger must be used within a Tabs component');
    return null;
  }
  
  const { value: activeValue, onValueChange } = context;
  const isActive = activeValue === value;

  return (
    <button 
      type="button" 
      className={className}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    console.error('TabsContent must be used within a Tabs component');
    return null;
  }
  
  const { value: activeValue } = context;
  
  // Only render the content when the tab is active
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
};
