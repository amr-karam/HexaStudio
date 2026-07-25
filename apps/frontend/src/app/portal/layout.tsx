import type { Metadata } from 'next';
import { PortalThemeProvider } from '@/features/portal/components/PortalThemeProvider';
import { PortalSidebar, PortalMobileSidebar } from '@/features/portal/components/PortalSidebar';
import { PortalTopBar } from '@/features/portal/components/PortalTopBar';
import { CommandPalette } from '@/features/portal/components/CommandPalette';

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
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Desktop Sidebar */}
        <PortalSidebar />

        {/* Mobile Sidebar Drawer */}
        <PortalMobileSidebar />

        {/* Top Bar */}
        <PortalTopBar />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-60 pt-16 min-h-screen flex flex-col">
          <div className="flex-1 px-6 md:px-12 py-10 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>

        {/* Command Palette Overlay */}
        <CommandPalette />
      </div>
    </PortalThemeProvider>
  );
}
