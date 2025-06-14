"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  ColorTheme,
  FontSize,
  CodeEditorSize,
  ThemeColors,
  UIColors,
  colorThemes,
  uiThemes,
  fontSizes,
  codeEditorSizes,
} from "@/lib/theme/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  themeColors: ThemeColors;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  codeEditorSize: CodeEditorSize;
  setCodeEditorSize: (size: CodeEditorSize) => void;
  themeMode: ThemeMode;
  uiColors: UIColors;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get stored preferences from localStorage when available
  const getInitialColorTheme = (): ColorTheme => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("colorTheme");
      if (savedTheme && Object.keys(colorThemes).includes(savedTheme)) {
        return savedTheme as ColorTheme;
      }
    }
    return "default";
  };

  const getInitialThemeMode = (): ThemeMode => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("themeMode");
      if (savedMode === "light" || savedMode === "dark") {
        return savedMode;
      }
      // Check system preference as fallback
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark";
      }
    }
    return "dark"; // Default to dark theme
  };

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getInitialColorTheme);
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [codeEditorSize, setCodeEditorSize] = useState<CodeEditorSize>("base");
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  // Update localStorage when preferences change
  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("colorTheme", theme);
    }
  };

  const toggleThemeMode = () => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", newMode);
    }
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", themeMode === "dark");
    }
  }, [themeMode]);

  // Load preferences from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("fontSize");
      if (savedFontSize && Object.keys(fontSizes).includes(savedFontSize)) {
        setFontSize(savedFontSize as FontSize);
      }

      const savedEditorSize = localStorage.getItem("codeEditorSize");
      if (savedEditorSize && Object.keys(codeEditorSizes).includes(savedEditorSize)) {
        setCodeEditorSize(savedEditorSize as CodeEditorSize);
      }
    }
  }, []);

  const themeColors = colorThemes[colorTheme];
  const uiColors = uiThemes[themeMode];

  const value: ThemeContextType = {
    colorTheme,
    setColorTheme,
    themeColors,
    fontSize,
    setFontSize,
    codeEditorSize,
    setCodeEditorSize,
    themeMode,
    uiColors,
    toggleThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};