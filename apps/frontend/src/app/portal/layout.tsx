import type { Metadata } from 'next';
import { PortalThemeProvider } from '@/features/portal/components/PortalThemeProvider';
import { PortalSidebar, PortalMobileSidebar } from '@/features/portal/components/PortalSidebar';
import { PortalTopBar } from '@/features/portal/components/PortalTopBar';
import { CommandPalette } from '@/features/portal/components/CommandPalette';

export const metadata: Metadata = {
  title: 'Client Portal | HEXA Studio',
  description: 'The digital headquarters for every HEXA Studio client. Track projects, approve deliverables, and collaborate in real-time.',
  openGraph: {
    title: 'HexaStudio Client Portal',
    description: 'The digital headquarters for every HEXA Studio client.',
    url: 'https://hexastudio.net/portal',
    type: 'website',
    images: [
      {
        url: 'https://hexastudio.net/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HexaStudio Client Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HexaStudio Client Portal',
    description: 'The digital headquarters for every HEXA Studio client.',
    images: ['https://hexastudio.net/og-image.png'],
  },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalThemeProvider>
      <div className="min-h-screen bg-sl-void text-sl-alabaster flex relative overflow-hidden">
        {/* Dynamic Ambient Light - Follows the "Silent Luxury" theme */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sl-gold-subtle/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sl-gold-subtle/5 blur-[120px]" />
        </div>

        {/* Desktop Sidebar - Now Glassmorphic */}
        <div className="z-20">
          <PortalSidebar />
        </div>

        {/* Mobile Sidebar Drawer */}
        <PortalMobileSidebar />

        {/* Top Bar - Now Floating Glass */}
        <div className="fixed top-0 right-0 left-0 z-30">
          <PortalTopBar />
        </div>

        {/* Main Content Area - Liquid Layout */}
        <main className="flex-1 min-h-screen flex flex-col relative z-10 lg:pl-64 pt-16">
          <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12 w-full max-w-[1600px] mx-auto transition-all duration-500 ease-in-out">
            {children}
          </div>
        </main>

        {/* Command Palette Overlay */}
        <CommandPalette />
      </div>
    </PortalThemeProvider>
  );
}

