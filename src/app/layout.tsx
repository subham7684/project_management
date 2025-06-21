import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import StoreProvider from '../store/StoreProvider';
import { ToastProvider } from '@/components/ui/use-toast';

export const metadata: Metadata = {
  title: 'Axiom',
  description: 'Project Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          {/* Use our custom ThemeProvider without any props */}
          <ThemeProvider>
          <ToastProvider>
            {children}
            </ToastProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}