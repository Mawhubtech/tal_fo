import React, { ReactNode } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  // The key issue is that we need to pass the parentValue prop to all children
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            parentValue: value, 
            onValueChange 
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
  parentValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, parentValue, onValueChange }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            parentValue, 
            onValueChange 
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
  parentValue?: string;
  onValueChange?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className, parentValue, onValueChange }) => {
  const isActive = parentValue === value;
  const combinedClassName = `${className} ${
    isActive 
      ? 'bg-purple-600 text-white'
      : 'bg-white hover:bg-purple-50 text-gray-700'
  }`;

  return (
    <button 
      type="button" 
      className={combinedClassName} 
      onClick={() => onValueChange?.(value)}
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
  parentValue?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, parentValue }) => {
  // Only render the content when the tab is active
  if (parentValue !== value) return null;
  return <div className={className}>{children}</div>;
};
