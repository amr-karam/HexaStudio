import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '@/components/AppProviders';
import { ToastProvider } from '@/components/ToastProvider';
import '@/styles/artisan-tokens.css';
import './globals.css';
import { cn } from '@/components/ui/cn';

/* ─── Font Optimization (next/font v3 — zero-layout-shift) ─── */
/* Inter — body & UI (variable font, swap) */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800', '900'],
});

/* Playfair Display — serif headings */
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

/* JetBrains Mono — code & UI accents */
const jetBrains = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'HEXA Hub — Enterprise Workspace',
    template: '%s | HEXA Hub',
  },
  description:
    'The unified collaboration platform for HEXA Studio — manage projects, clients, finances, and team operations.',
  keywords: [
    'architecture',
    'design',
    'project management',
    'CRM',
    'ERP',
    'financial reports',
  ],
  authors: [{ name: 'HEXA Studio', url: 'https://hexastudio.net' }],
  creator: 'HEXA Studio',
  openGraph: {
    title: 'HEXA Hub — Enterprise Workspace',
    description: 'The unified collaboration platform for HEXA Studio.',
    url: 'https://hexastudio.net',
    siteName: 'HEXA Hub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HEXA Hub — Enterprise Workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@hexastudio',
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
    <html
      lang="en"
      className={cn(
        inter.variable,
        playfair.variable,
        jetBrains.variable,
        'h-full scroll-smooth',
      )}
    >
      <head>
        {/* Preload hero font for LCP */}
        <link
          rel="preload"
          href="/fonts/playfair-display-latin-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground antialiased',
          'font-sans',
          inter.className,
          'h-full',
        )}
      >
        <AppProviders>
          <ToastProvider>{children}</ToastProvider>
        </AppProviders>
      </body>
    </html>
  );
}
