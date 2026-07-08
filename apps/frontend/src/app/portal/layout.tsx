import type { Metadata } from 'next';
import { AppProviders } from '@/providers/app-providers';
import { Navbar } from '@/components/ui/nav/Navbar';
import { Footer } from '@/components/ui/Footer';
import { PageTransition } from '@/components/PageTransition';
import { SmoothScrollWrapper } from '@/components/SmoothScrollWrapper';
import { CustomCursor } from '@/components/CustomCursor';
import { BackToTop } from '@/components/BackToTop';
import './globals.css';

export const metadata: Metadata = {
  title: 'Client Portal | HexaStudio',
  description: 'Your exclusive gateway to project progress and deliverables.',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <BackToTop />
          </SmoothScrollWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
