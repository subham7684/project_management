import React, { useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'destructive' | 'success';

// Toast interface
interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Context to manage toast state across the application
interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, ...newToast };
    setToasts((prev) => [...prev, toast]);
    
    // Auto dismiss after duration
    const duration = newToast.duration || 5000;
    setTimeout(() => {
      dismiss(id);
    }, duration);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast functionality
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

// Toast UI Component
const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useContext(ToastContext) as ToastContextType;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-md min-w-[300px] max-w-[500px] animate-enter relative ${
            toast.variant === 'destructive' 
              ? 'bg-red-600 text-white'
              : toast.variant === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {toast.title && (
                <h3 className="font-medium">{toast.title}</h3>
              )}
              {toast.description && (
                <p className="text-sm opacity-90 mt-1">{toast.description}</p>
              )}
            </div>
            <button 
              onClick={() => dismiss(toast.id)}
              className="opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// For direct implementation without context
export const toast = {
  show: (props: { title?: string; description?: string; variant?: ToastVariant }) => {
    // Create temporary DOM element
    const container = document.createElement('div');
    container.className = 'fixed top-4 right-4 z-50 animate-enter';
    document.body.appendChild(container);

    // Create toast element
    const toastElement = document.createElement('div');
    toastElement.className = `p-4 rounded-md shadow-md min-w-[300px] max-w-[500px] ${
      props.variant === 'destructive' 
        ? 'bg-red-600 text-white'
        : props.variant === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
    }`;

    // Toast content
    toastElement.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          ${props.title ? `<h3 class="font-medium">${props.title}</h3>` : ''}
          ${props.description ? `<p class="text-sm opacity-90 mt-1">${props.description}</p>` : ''}
        </div>
        <button class="opacity-70 hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    // Add to container
    container.appendChild(toastElement);

    // Add close functionality
    const closeButton = toastElement.querySelector('button');
    closeButton?.addEventListener('click', () => {
      container.classList.add('animate-leave');
      setTimeout(() => {
        document.body.removeChild(container);
      }, 300);
    });

    // Auto dismiss
    setTimeout(() => {
      container.classList.add('animate-leave');
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }, 300);
    }, 5000);
  }
};

export default useToast;