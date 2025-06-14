import { ColorTheme } from '@/lib/theme/theme';
import { LucideIcon } from 'lucide-react';

export interface NavLink {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export interface NavLinkConfig {
  name: string;
  href: string;
}

export interface ThemeOption {
  color: ColorTheme;
  bgClass: string;
  label: string;
}

export interface User {
  full_name?: string;
  email?: string;
  // Add other user properties as needed
}

// Navigation links config - without icons, which will be added in the component
export const sidebarLinksConfig: NavLinkConfig[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Status Board', href: '/status_board' },
  { name: 'Tickets', href: '/tickets' },
  { name: 'Projects', href: '/projects' },
  { name: 'Sprints', href: '/sprints' },
  { name: 'Epics', href: '/epics' },
  { name: 'Reports', href: '/reports' },
  { name: 'Settings', href: '/settings' },
  { name: 'Query Me', href: '/dynamic' },
];

// Theme config for the color selector
export const themeOptions: ThemeOption[] = [
  { color: 'default', bgClass: 'bg-blue-500', label: 'Blue' },
  { color: 'indigo', bgClass: 'bg-indigo-500', label: 'Indigo' },
  { color: 'teal', bgClass: 'bg-teal-500', label: 'Teal' },
  { color: 'emerald', bgClass: 'bg-emerald-500', label: 'Emerald' },
  { color: 'purple', bgClass: 'bg-purple-500', label: 'Purple' },
  { color: 'rose', bgClass: 'bg-rose-500', label: 'Rose' },
  { color: 'amber', bgClass: 'bg-amber-500', label: 'Amber' },
  { color: 'slate', bgClass: 'bg-slate-600', label: 'Slate' },
];