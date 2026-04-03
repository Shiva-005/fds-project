import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FDS - Finance Dashboard System',
  description: 'Production-ready Finance Dashboard with RBAC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
