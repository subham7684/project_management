"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/redux';
import { logout } from '@/store/slices/authSlice';
import { useAppTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/lib/theme/theme';

// Import components
import TopBar from './TopBar';
import SidebarNavItem from './sideBarNavItems';
import UserProfileSection from './userProfileSection';

// Import types and constants
import { sidebarLinksConfig, NavLink, User } from './types';

// Icons
import { 
  LayoutDashboard, 
  Ticket, 
  FolderKanban, 
  GitPullRequest, 
  ListTodo, 
  BarChart4, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  WorkflowIcon,
  SearchCode,
  LucideIcon
} from 'lucide-react';

// Type definitions
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Map of icons to use for each route
const iconMap: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/status_board': WorkflowIcon,
  '/tickets': Ticket,
  '/projects': FolderKanban,
  '/sprints': GitPullRequest,
  '/epics': ListTodo,
  '/reports': BarChart4,
  '/settings': Settings,
  '/dynamic': SearchCode,
};

// Create sidebar links with icons
const sidebarLinks: NavLink[] = sidebarLinksConfig.map(link => ({
  ...link,
  icon: iconMap[link.href]
}));

// Main component
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { uiColors, themeColors, themeMode, toggleThemeMode, colorTheme, setColorTheme } = useAppTheme();
  
  const user = useAppSelector(state => state.auth.user) as User | null;
  const dispatch = useAppDispatch();

  // Handle theme-related side effects
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    dispatch(logout());
  };
  
  const handleColorChange = (color: ColorTheme) => {
    setColorTheme(color);
  };

  // Animation variants
  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '72px' }
  };

  const mainContentVariants = {
    expanded: { marginLeft: '240px' },
    collapsed: { marginLeft: '72px' }
  };

  // Handle SSR
  if (!mounted) return null;

  return (
    <div className={`flex h-screen ${uiColors.pageBg}`}>
      {/* Sidebar */}
      <motion.div
        className={`fixed h-full ${uiColors.cardBg} border-r ${uiColors.borderColor} z-30 overflow-hidden shadow-lg`}
        variants={sidebarVariants}
        animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className={`flex items-center justify-between p-4 h-16 border-b ${uiColors.borderColor} ${themeColors.highlightBg}`}>
            {!isSidebarCollapsed && (
              <Link href="/dashboard" className={`font-bold text-xl ${themeColors.primaryText}`}>
                Axiom
              </Link>
            )}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full bg-white/20 hover:bg-white/30 ${themeColors.buttonText} transition-colors duration-200`}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
            <ul className="space-y-1 px-2">
              {sidebarLinks.map((link) => (
                <SidebarNavItem
                  key={link.name}
                  link={link}
                  isActive={pathname?.startsWith(link.href) || false}
                  isSidebarCollapsed={isSidebarCollapsed}
                  uiColors={uiColors}
                  themeColors={themeColors}
                />
              ))}
            </ul>
          </nav>

          {/* User Profile Section */}
          <UserProfileSection
            isSidebarCollapsed={isSidebarCollapsed}
            user={user}
            handleLogout={handleLogout}
            uiColors={uiColors}
            themeColors={themeColors}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col"
        variants={mainContentVariants}
        animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Top Header */}
        <TopBar 
          uiColors={uiColors}
          themeColors={themeColors}
          themeMode={themeMode}
          toggleThemeMode={toggleThemeMode}
          colorTheme={colorTheme}
          handleColorChange={handleColorChange}
        />

        {/* Page Content */}
        <main className={`flex-1 overflow-auto p-6 ${uiColors.pageBg}`}>
          {children}
        </main>
      </motion.div>
    </div>
  );
}