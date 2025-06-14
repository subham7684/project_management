import React, { useState, useRef, useEffect, ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  value?: string;
  disabled?: boolean;
  className?: string; // Added className prop
}

interface SelectValueProps {
  placeholder?: string;
  className?: string; // Added className prop
}

interface SelectContentProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string; // Added className prop
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
  className?: string; // Added className prop
}

// Component declarations
export const SelectTrigger = ({ children, open, setOpen, disabled = false, className = '' }: SelectTriggerProps) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
      } ${className}`}
      onClick={() => !disabled && setOpen && setOpen(!open)}
      disabled={disabled}
    >
      {children}
      <ChevronDown size={16} className="ml-2 opacity-70" />
    </button>
  );
};

export const SelectValue = ({ placeholder, className = '' }: SelectValueProps) => {
  return <span className={`truncate ${className}`}>{placeholder}</span>;
};

export const SelectItem = ({ children, value, onSelect, isSelected = false, className = '' }: SelectItemProps) => {
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer ${
        isSelected 
          ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400" 
          : "hover:bg-gray-100 dark:hover:bg-gray-700"
      } ${className}`}
      onClick={() => onSelect && onSelect(value)}
    >
      {children}
    </div>
  );
};

export const SelectContent = ({ children, setOpen, value, onValueChange, className = '' }: SelectContentProps) => {
  return (
    <div className={`absolute mt-1 w-full z-50 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-lg max-h-60 overflow-auto ${className}`}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        
        const childType = (child.type as React.ComponentType<unknown>).displayName;
        
        if (childType === 'SelectItem') {
          return React.cloneElement(child as ReactElement<SelectItemProps>, { 
            onSelect: (itemValue: string) => {
              onValueChange?.(itemValue);
              setOpen?.(false);
            },
            isSelected: value === (child.props as SelectItemProps).value
          });
        }
        return child;
      })}
    </div>
  );
};

export const Select = ({ value, onValueChange, children, disabled = false, className = '' }: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`} ref={ref}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        
        const childType = (child.type as React.ComponentType<unknown>).displayName;
        
        if (childType === 'SelectTrigger') {
          return React.cloneElement(child as ReactElement<SelectTriggerProps>, { 
            open, 
            setOpen, 
            value,
            disabled
          });
        }
        if (childType === 'SelectContent') {
          return open ? React.cloneElement(child as ReactElement<SelectContentProps>, { 
            open, 
            setOpen, 
            value, 
            onValueChange 
          }) : null;
        }
        return child;
      })}
    </div>
  );
};

// Add displayName to components for proper type checking
SelectTrigger.displayName = 'SelectTrigger';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
SelectValue.displayName = 'SelectValue';

export default Select;