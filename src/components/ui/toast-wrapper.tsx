// src/components/ui/toast-wrapper.ts
import { toast as toastImplementation } from './use-toast';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
}

// Wrapper function that matches the interface used in the comment components
export const toast = (props: ToastProps) => {
  toastImplementation.show({
    title: props.title,
    description: props.description,
    variant: props.variant || 'default'
  });
};