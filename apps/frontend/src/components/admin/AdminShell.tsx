'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DesignPanel } from '@/components/admin/DesignPanel';
import { SidebarNav } from '@/components/admin/SidebarNav';
import { LivePreviewIframe } from '@/components/admin/LivePreviewIframe';
import { PropertiesPanel } from '@/components/admin/PropertiesPanel';
import type { DesignSettings } from '@/lib/design-tokens';
import { fetchDesignSettings, publishDesignSettings } from '@/lib/design-tokens';

const SLIDE_OVER_THRESHOLD = 80;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('design');
  const [designSettings, setDesignSettings] = useState<DesignSettings | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ tagName: string; styles: Record<string, string> } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastMouseX = useRef(0);

  // Load design settings on mount
  useEffect(() => {
    fetchDesignSettings().then(setDesignSettings).catch(() => {
      // Fallback to default settings if Strapi is unreachable
        setDesignSettings({
          colors: { gold: '#D4AF37', void: '#050505', obsidian: '#0F0F10', alabaster: '#F5F4F2', muted: '#A0A0A0', goldSubtle: 'rgba(212,175,55,0.15)' },
          typography: { headingFont: 'Bodoni Moda', bodyFont: 'Inter', monoFont: 'JetBrains Mono', headingTracking: '-0.02em', bodySize: '1rem' },
        siteIdentity: { logo: '', wordmark: 'HexaStudio', tagline: 'Living Spaces. Visualized.' },
        header: { variant: 'transparent', menu: [] },
        hero: { variant: 'void-garden', monolithCount: 24, showChapterRail: true },
        footer: { kicker: 'Hexa Studio — Architectural Visualization', cta: "Let's build — something extraordinary.", wordmarkItalic: true },
        customCss: '',
      });
    });
  }, []);

  // Handle sidebar mouse enter/leave for expand/collapse
  const handleSidebarMouseEnter = useCallback(() => {
    if (window.innerWidth >= 768) setSidebarExpanded(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    if (window.innerWidth >= 768) setSidebarExpanded(false);
  }, []);

  // Handle mousedown on sidebar to keep it expanded while interacting
  const handleSidebarMouseDown = useCallback(() => {
    setSidebarExpanded(true);
    lastMouseX.current = 0;
  }, []);

  const handleSidebarMouseMove = useCallback((e: React.MouseEvent) => {
    const dx = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;
    if (Math.abs(dx) > SLIDE_OVER_THRESHOLD) {
      setSidebarExpanded(true);
    }
  }, []);

  // Handle iframe element click → show properties panel
  const handleIframeElementClick = useCallback((element: { tagName: string; styles: Record<string, string> } | null) => {
    setSelectedElement(element);
  }, []);

  // Publish design settings to Strapi
  const handlePublish = useCallback(async () => {
    if (!designSettings) return;
    await publishDesignSettings(designSettings);
    router.refresh();
  }, [designSettings, router]);

  // Discard changes — revert to last saved
  const handleDiscard = useCallback(() => {
    fetchDesignSettings().then(setDesignSettings);
  }, []);

  return (
    <div className="min-h-screen bg-sl-void text-sl-alabaster flex overflow-hidden">
      {/* Sidebar */}
      <SidebarNav
        ref={sidebarRef}
        expanded={sidebarExpanded}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onMouseDown={handleSidebarMouseDown}
        onMouseMove={handleSidebarMouseMove}
        selectedSection={selectedSection}
        onSectionSelect={setSelectedSection}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-sl-glass-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-['JetBrains_Mono'] text-xs text-sl-silver uppercase tracking-[0.15em]">
              {selectedSection === 'design' && 'Design & Content'}
              {selectedSection === 'content' && 'Content'}
              {selectedSection === 'projects' && 'Odoo — Projects'}
              {selectedSection === 'crm' && 'Odoo — CRM'}
              {selectedSection === 'sales' && 'Odoo — Sales'}
              {selectedSection === 'accounting' && 'Odoo — Accounting'}
              {selectedSection === 'team' && 'Odoo — Team'}
              {selectedSection === 'upload' && 'Upload Centre'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-md hover:bg-sl-glass transition-colors" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sl-silver">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sl-gold-subtle flex items-center justify-center text-xs font-bold text-accent">
                H
              </div>
              <span className="font-['JetBrains_Mono'] text-xs text-sl-silver hidden sm:block">Admin</span>
            </div>
            <button className="p-2 rounded-md hover:bg-sl-glass transition-colors" aria-label="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sl-silver">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Live preview iframe */}
        <div className="flex-1 relative min-h-0">
          <LivePreviewIframe
            previewUrl={typeof window !== 'undefined' ? `${window.location.origin}/?preview=true` : ''}
            designSettings={designSettings}
            onElementClick={handleIframeElementClick}
          />
        </div>

        {/* Properties panel (bottom) */}
        {selectedElement && (
          <PropertiesPanel
            element={selectedElement}
            designSettings={designSettings}
            onUpdate={(updates) => {
              if (designSettings) {
                setDesignSettings({ ...designSettings, ...updates });
              }
            }}
            onClose={() => setSelectedElement(null)}
          />
        )}

        {/* Design panel (left, slides in when Design & Content selected) */}
        {selectedSection === 'design' && designSettings && (
          <DesignPanel
            settings={designSettings}
            onChange={setDesignSettings}
            onPublish={handlePublish}
            onDiscard={handleDiscard}
          />
        )}

        {/* Children (placeholder pages for other sections) */}
        {children}
      </div>
    </div>
  );
}
