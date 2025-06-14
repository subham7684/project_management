"use client";

import React from 'react';
import Link from 'next/link';
import { ThemeColors, UIColors } from '@/lib/theme/theme';
import { NavLink } from '../types';

interface SidebarNavItemProps {
  link: NavLink;
  isActive: boolean;
  isSidebarCollapsed: boolean;
  uiColors: UIColors;
  themeColors: ThemeColors;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  link, 
  isActive, 
  isSidebarCollapsed,
  uiColors,
  themeColors
}) => {
  // If icon is not provided, we'll render without an icon
  const IconComponent = link.icon;
  
  return (
    <li>
      <Link
        href={link.href}
        className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200
          ${isActive
            ? `${themeColors.buttonBg} ${themeColors.buttonText} shadow-md`
            : `${uiColors.secondaryText} ${uiColors.hoverBg.replace('hover:', '')}`
          }`}
      >
        {IconComponent && <IconComponent size={20} />}
        {!isSidebarCollapsed && (
          <span className={IconComponent ? "ml-3 font-medium" : "font-medium"}>
            {link.name}
          </span>
        )}
      </Link>
    </li>
  );
};

export default SidebarNavItem;