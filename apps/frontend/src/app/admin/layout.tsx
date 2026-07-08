import type { Metadata } from 'next';
import { AppProviders } from '@/providers/app-providers';
import { Navbar } from '@/components/ui/nav/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PageTransition } from '@/components/PageTransition';
import { SmoothScrollWrapper } from '@/components/SmoothScrollWrapper';
import { CustomCursor } from '@/components/CustomCursor';
import './globals.css';

export const metadata: Metadata = {
  title: 'Studio Admin | HexaStudio',
  description: 'Internal management dashboard for HexaStudio operations.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <SmoothScrollWrapper>
            <CustomCursor />
            <Navbar />
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
          </SmoothScrollWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
