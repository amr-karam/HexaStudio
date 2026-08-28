import type { Metadata } from 'next';
import { PortalThemeProvider } from '@/features/portal/components/PortalThemeProvider';
import { PortalSidebar, PortalMobileSidebar } from '@/features/portal/components/PortalSidebar';
import { PortalTopBar } from '@/features/portal/components/PortalTopBar';
import { CommandPalette } from '@/features/portal/components/CommandPalette';
import { PortalLayoutContent } from '@/features/portal/components/PortalLayoutContent';

export const metadata: Metadata = {
  title: 'Client Portal | HEXA Studio',
  description: 'The digital headquarters for every HEXA Studio client.',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalThemeProvider>
      <div className="min-h-screen bg-sl-obsidian text-sl-alabaster flex relative overflow-hidden">
        {/* Dynamic Ambient Light - "Silent Luxury" gold glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-sl-gold-subtle/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-sl-gold-subtle/20 blur-[120px]" />
        </div>

        {/* Desktop Sidebar - Glassmorphic icon rail */}
        <PortalSidebar />

        {/* Mobile Sidebar Drawer */}
        <PortalMobileSidebar />

        {/* Top Bar - Floating Glass */}
        <div className="fixed top-0 right-0 left-0 z-30">
          <PortalTopBar />
        </div>

        {/* Main Content Area — dynamically offsets for sidebar state */}
        <PortalLayoutContent>{children}</PortalLayoutContent>

        {/* Command Palette Overlay */}
        <CommandPalette />
      </div>
    </PortalThemeProvider>
  );
}

