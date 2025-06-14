import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string; // Added className prop
}

export const Dialog = ({ open, onOpenChange, children, className = '' }: DialogProps) => {
  if (!open) return null;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent = ({ children, className = '' }: DialogContentProps) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

export const DialogHeader = ({ children, className = '' }: DialogHeaderProps) => {
  return <div className={`pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

export const DialogTitle = ({ children, className = '' }: DialogTitleProps) => {
  return <h2 className={`text-lg font-medium ${className}`}>{children}</h2>;
};

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

export const DialogFooter = ({ children, className = '' }: DialogFooterProps) => {
  return <div className={`pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 ${className}`}>{children}</div>;
};

export default Dialog;