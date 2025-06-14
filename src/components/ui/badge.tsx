import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

export const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}: BadgeProps) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 bg-transparent",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;