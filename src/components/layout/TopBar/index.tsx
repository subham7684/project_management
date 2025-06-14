"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, Palette, Check } from 'lucide-react';
import { ColorTheme, ThemeColors, UIColors } from '@/lib/theme/theme';

interface ThemeOption {
  color: ColorTheme;
  bgClass: string;
  label: string;
}

// Theme config for the color selector
const themeOptions: ThemeOption[] = [
  { color: 'default', bgClass: 'bg-blue-500', label: 'Blue' },
  { color: 'indigo', bgClass: 'bg-indigo-500', label: 'Indigo' },
  { color: 'teal', bgClass: 'bg-teal-500', label: 'Teal' },
  { color: 'emerald', bgClass: 'bg-emerald-500', label: 'Emerald' },
  { color: 'purple', bgClass: 'bg-purple-500', label: 'Purple' },
  { color: 'rose', bgClass: 'bg-rose-500', label: 'Rose' },
  { color: 'amber', bgClass: 'bg-amber-500', label: 'Amber' },
  { color: 'slate', bgClass: 'bg-slate-600', label: 'Slate' },
];

interface TopBarProps {
  uiColors: UIColors;
  themeColors: ThemeColors;
  themeMode: string;
  toggleThemeMode: () => void;
  colorTheme: ColorTheme;
  handleColorChange: (color: ColorTheme) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  uiColors, 
  themeColors, 
  themeMode, 
  toggleThemeMode, 
  colorTheme, 
  handleColorChange 
}) => {
  const [colorSelectorOpen, setColorSelectorOpen] = useState(false);
  const colorSelectorRef = useRef<HTMLDivElement>(null);

  // Close color selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorSelectorRef.current && !colorSelectorRef.current.contains(event.target as Node)) {
        setColorSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`h-16 border-b ${uiColors.borderColor} flex items-center justify-between px-6 ${uiColors.navbarBg} shadow-sm z-30`}>
      <div className="flex items-center space-x-4 w-1/2">
        <div className="relative w-full max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiColors.mutedText}`} size={18} />
          <input
            type="text"
            placeholder="Search..."
            className={`pl-10 py-2 pr-4 w-full rounded-lg border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing} transition-all duration-200`}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Theme Mode Toggle */}
        <button 
          onClick={toggleThemeMode}
          className={`p-2 rounded-full ${uiColors.hoverBg} transition-colors duration-200`}
          aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          {themeMode === 'light' ? (
            <Moon size={20} className={themeColors.iconFill} />
          ) : (
            <Sun size={20} className={themeColors.iconFill} />
          )}
        </button>
        
        {/* Color Theme Selector */}
        <div className="relative">
          <button 
            onClick={() => setColorSelectorOpen(!colorSelectorOpen)}
            className={`p-2 rounded-full ${uiColors.hoverBg} transition-colors duration-200`}
            aria-label="Change theme color"
          >
            <Palette size={20} className={themeColors.iconFill} />
          </button>
          
          {colorSelectorOpen && (
            <div 
              className={`absolute right-0 mt-2 p-3 rounded-lg shadow-lg ${uiColors.cardBg} border ${uiColors.borderColor} z-50`}
              style={{ width: '240px' }}
              ref={colorSelectorRef}
            >
              <h3 className={`text-sm font-medium mb-3 ${uiColors.primaryText}`}>Select Theme</h3>
              <div className="grid grid-cols-4 gap-3">
                {themeOptions.map((option) => (
                  <button
                    key={option.color}
                    onClick={() => handleColorChange(option.color)}
                    className="flex flex-col items-center group"
                    aria-label={`${option.label} theme`}
                  >
                    <div className={`relative w-10 h-10 rounded-full ${option.bgClass} group-hover:ring-2 group-hover:ring-offset-2 dark:group-hover:ring-offset-gray-800 transition-all ${
                      colorTheme === option.color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''
                    }`}>
                      {colorTheme === option.color && (
                        <Check size={16} className="absolute inset-0 m-auto text-white" />
                      )}
                    </div>
                    <span className={`mt-1 text-xs ${uiColors.secondaryText} group-hover:${themeColors.accentText} ${
                      colorTheme === option.color ? themeColors.accentText : ''
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;