import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import StoreProvider from '../store/StoreProvider';

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
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}