import React, { useState, ReactElement } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
}

// Forward declarations to use for type checking
export const TabsList = ({ children, activeTab, setActiveTab }: TabsListProps) => {
  return (
    <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as ReactElement<TabsTriggerProps>, { 
          activeTab, 
          setActiveTab 
        });
      })}
    </div>
  );
};

export const TabsContent = ({ value, children, activeTab }: TabsContentProps) => {
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};

export const Tabs = ({ defaultValue, children, className = '' }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        
        // Use function component displayName for type checking
        const childType = (child.type as React.ComponentType<TabsListProps | TabsContentProps | TabsTriggerProps>).name || (child.type as React.ComponentType<TabsListProps | TabsContentProps | TabsTriggerProps>).displayName;
        
        if (childType === 'TabsList') {
          return React.cloneElement(child as ReactElement<TabsListProps>, { 
            activeTab, 
            setActiveTab 
          });
        }
        if (childType === 'TabsContent') {
          return React.cloneElement(child as ReactElement<TabsContentProps>, { 
            activeTab 
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }: TabsTriggerProps) => {
  const isActive = activeTab === value;
  
  return (
    <button
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? "border-b-2 border-blue-500 text-blue-600" 
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      }`}
      onClick={() => setActiveTab && setActiveTab(value)}
    >
      {children}
    </button>
  );
};

// Add displayName to components for proper type checking
TabsList.displayName = 'TabsList';
TabsContent.displayName = 'TabsContent';
TabsTrigger.displayName = 'TabsTrigger';

export default Tabs;