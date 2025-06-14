"use client";

import React from "react";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerColor = "default" | "primary" | "secondary" | "white";

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = "md", 
  color = "primary", 
  className = "" 
}) => {
  // Size mappings
  const sizeClasses: Record<SpinnerSize, string> = {
    xs: "h-4 w-4",
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Color mappings
  const colorClasses: Record<SpinnerColor, string> = {
    default: "text-gray-600 dark:text-gray-400",
    primary: "text-blue-600 dark:text-blue-400",
    secondary: "text-purple-600 dark:text-purple-400",
    white: "text-white",
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
  );
};

export default Spinner;