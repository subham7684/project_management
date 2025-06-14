'use client';

import React from 'react';

interface TabType {
  id: string;
  name: string;
  description?: string;
}

interface TabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: TabType[];
}

export default function TabSwitcher({ activeTab, setActiveTab, tabs }: TabSwitcherProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700 pb-1">
      {tabs.map((type) => (
        <button
          key={type.id}
          onClick={() => setActiveTab(type.id)}
          className={`whitespace-nowrap px-4 py-2 mr-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === type.id
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
}
