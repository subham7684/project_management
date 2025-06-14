"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { ThemeColors, UIColors } from '@/lib/theme/theme';

interface User {
  full_name?: string;
  email?: string;
}

interface UserProfileSectionProps {
  isSidebarCollapsed: boolean;
  user: User | null;
  handleLogout: () => void;
  uiColors: UIColors;
  themeColors: ThemeColors;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  isSidebarCollapsed,
  // user,
  handleLogout,
  uiColors,
  // themeColors
}) => (
  <div className={`p-4 border-t ${uiColors.borderColor} ${uiColors.softBg}`}>
    <div className="flex items-center">
      {/* <div className={`w-10 h-10 rounded-full ${themeColors.buttonBg} ${themeColors.buttonText} flex items-center justify-center font-medium text-lg shadow-md`}>
        {user?.full_name?.charAt(0) || 'U'}
      </div> */}
      {!isSidebarCollapsed && (
        <div className="ml-3 overflow-hidden">
          {/* <p className={`font-medium ${uiColors.primaryText} truncate`}>
            {user?.full_name || 'User'}
          </p> */}
          {/* <p className={`text-xs ${uiColors.mutedText} truncate`}>
            {user?.email || ''}
          </p> */}
        </div>
      )}
    </div>
    
    {!isSidebarCollapsed && (
      <button
        onClick={handleLogout}
        className="mt-4 w-full flex items-center justify-center py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 font-medium"
      >
        <LogOut size={16} />
        <span className="ml-2">Logout</span>
      </button>
    )}
  </div>
);

export default UserProfileSection;