"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAppTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/lib/theme/theme';
import { Sun, Moon, Check, ChevronDown } from 'lucide-react';

interface ThemeSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'grid';
  showModeToggle?: boolean;
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'dropdown',
  showModeToggle = true,
  compact = false,
}) => {
  const { colorTheme, setColorTheme, themeMode, toggleThemeMode, uiColors, themeColors } = useAppTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enhanced theme options with better organization
  const themeOptions = [
    { value: 'default', label: 'Blue', color: 'bg-blue-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' },
    { value: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'rose', label: 'Rose', color: 'bg-rose-500' },
    { value: 'amber', label: 'Amber', color: 'bg-amber-500' },
    { value: 'slate', label: 'Slate', color: 'bg-slate-600' },
  ];

  // Dropdown variant with an improved UI
  if (variant === 'dropdown') {
    return (
      <div className="flex items-center gap-2">
        {showModeToggle && (
          <button
            onClick={toggleThemeMode}
            className={`p-2 rounded-full ${uiColors.hoverBg} transition-colors`}
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {themeMode === 'light' ? (
              <Moon size={compact ? 16 : 18} className={themeColors.iconFill} />
            ) : (
              <Sun size={compact ? 16 : 18} className={themeColors.iconFill} />
            )}
          </button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 border ${uiColors.borderColor} rounded-md ${uiColors.inputBg} ${uiColors.hoverBg.replace('hover:', '')} transition-colors`}
          >
            <div className={`w-4 h-4 rounded-full ${themeOptions.find(t => t.value === colorTheme)?.color}`}></div>
            {!compact && (
              <span className={`text-sm ${uiColors.secondaryText}`}>
                {themeOptions.find(t => t.value === colorTheme)?.label}
              </span>
            )}
            <ChevronDown size={14} className={uiColors.mutedText} />
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 mt-1 p-2 rounded-md shadow-lg border ${uiColors.borderColor} ${uiColors.cardBg} z-50`} style={{ width: compact ? '150px' : '180px' }}>
              <div className={`text-xs font-medium mb-1.5 ${uiColors.mutedText}`}>Theme Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setColorTheme(option.value as ColorTheme);
                      setDropdownOpen(false);
                    }}
                    className="group flex flex-col items-center p-1.5"
                  >
                    <div className={`relative w-6 h-6 rounded-full ${option.color} group-hover:ring-2 group-hover:ring-offset-2 dark:group-hover:ring-offset-gray-800 transition-all ${
                      colorTheme === option.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''
                    }`}>
                      {colorTheme === option.value && (
                        <Check size={14} className="absolute inset-0 m-auto text-white" />
                      )}
                    </div>
                    <span className={`mt-1 text-xs ${colorTheme === option.value ? themeColors.accentText : uiColors.secondaryText}`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid variant - a modern, visual theme selector
  if (variant === 'grid') {
    return (
      <div className="flex flex-col gap-4">
        {showModeToggle && (
          <div className="flex justify-center">
            <button
              onClick={toggleThemeMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${uiColors.softBg} ${uiColors.borderColor} border transition-colors`}
            >
              {themeMode === 'light' ? (
                <>
                  <Moon size={18} className={themeColors.iconFill} />
                  <span className={uiColors.secondaryText}>Dark mode</span>
                </>
              ) : (
                <>
                  <Sun size={18} className={themeColors.iconFill} />
                  <span className={uiColors.secondaryText}>Light mode</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setColorTheme(option.value as ColorTheme)}
              className="flex flex-col items-center group"
            >
              <div className={`relative w-10 h-10 rounded-full ${option.color} group-hover:ring-2 group-hover:ring-offset-2 dark:group-hover:ring-offset-gray-800 transition-all ${
                colorTheme === option.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''
              }`}>
                {colorTheme === option.value && (
                  <Check size={16} className="absolute inset-0 m-auto text-white" />
                )}
              </div>
              <span className={`mt-1 text-xs ${colorTheme === option.value ? themeColors.accentText : uiColors.secondaryText}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Button variant - compact color circles
  return (
    <div className="flex items-center gap-3">
      {showModeToggle && (
        <button
          onClick={toggleThemeMode}
          className={`p-2 rounded-full ${uiColors.hoverBg} transition-colors`}
          aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          {themeMode === 'light' ? (
            <Moon size={compact ? 16 : 18} className={themeColors.iconFill} />
          ) : (
            <Sun size={compact ? 16 : 18} className={themeColors.iconFill} />
          )}
        </button>
      )}

      <div className="flex flex-wrap gap-1.5">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setColorTheme(option.value as ColorTheme)}
            className={`w-6 h-6 rounded-full ${option.color} hover:ring-2 hover:ring-offset-2 dark:hover:ring-offset-gray-800 transition-all ${
              colorTheme === option.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800' : ''
            }`}
            aria-label={`Switch to ${option.label} theme`}
            title={option.label}
          >
            {colorTheme === option.value && (
              <Check size={14} className="m-auto text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};