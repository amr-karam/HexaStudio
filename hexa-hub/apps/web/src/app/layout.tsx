import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProviders } from '@/components/AppProviders';
import { ToastProvider } from '@/components/ToastProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'HEXA Hub — Enterprise Workspace',
    template: '%s | HEXA Hub',
  },
  description: 'The unified collaboration platform for HEXA Studio — manage projects, clients, finances, and team operations.',
  keywords: ['architecture', 'design', 'project management', 'CRM', 'ERP', 'financial reports'],
  authors: [{ name: 'HEXA Studio', url: 'https://hexastudio.net' }],
  creator: 'HEXA Studio',
  openGraph: {
    title: 'HEXA Hub — Enterprise Workspace',
    description: 'The unified collaboration platform for HEXA Studio.',
    url: 'https://hexastudio.net',
    siteName: 'HEXA Hub',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
  metadataBase: new URL('https://hexastudio.net'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        <AppProviders>
          <ToastProvider>{children}</ToastProvider>
        </AppProviders>
      </body>
    </html>
  );
}
