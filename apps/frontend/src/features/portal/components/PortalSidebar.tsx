'use client';

import { MouseEvent, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePortalStore } from '@/features/portal/store';
import { Icon } from '@/features/portal/components/PortalIcons';
import { PortalNavSection, PortalNavItem } from '@/features/portal/types';

const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    marker: 'Overview',
    items: [
      { label: 'Dashboard', href: '/portal', icon: 'layout-dashboard' },
      { label: 'Projects', href: '/portal/projects', icon: 'folder-kanban' },
      { label: '3D Live Review', href: '/portal/review', icon: 'box' },
    ],
  },
  {
    marker: 'Workspace',
    items: [
      { label: 'Approvals', href: '/portal/approvals', icon: 'check-circle' },
      { label: 'Documents', href: '/portal/documents', icon: 'file-text' },
      { label: 'Finance', href: '/portal/finance', icon: 'receipt' },
      { label: 'AI Studio', href: '/portal/ai', icon: 'sparkles' },
      { label: 'Design System', href: '/design-system', icon: 'palette' },
    ],
  },
  {
    marker: 'System',
    items: [
      { label: 'Support', href: '/portal/support', icon: 'help-circle' },
      { label: 'Analytics', href: '/portal/analytics', icon: 'bar-chart' },
      { label: 'Settings', href: '/portal/settings', icon: 'settings' },
    ],
  },
];

interface SidebarNavProps {
  ref: React.RefObject<HTMLDivElement | null>;
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  selectedSection: string;
  onSectionSelect: (section: string) => void;
}

function SidebarNav({
  ref,
  expanded,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseMove,
  selectedSection,
  onSectionSelect,
}: SidebarNavProps) {
  return (
    <nav
      ref={ref}
      className={cn(
        'shrink-0 border-r transition-all duration-300 ease-out relative',
        'border-sl-glass-border hover:border-sl-gold-subtle',
        expanded ? 'w-[260px]' : 'w-[80px]'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
    >
      {/* Logo mark — always visible */}
      <div className="flex items-center justify-center h-14 border-b border-sl-glass-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-[#0A0A0B] shrink-0">
            H
          </div>
          {expanded && (
            <span className="font-['Bodoni_Moda'] text-sm text-accent whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
              Hexa Command Centre
            </span>
          )}
        </div>
      </div>

      {/* Section list */}
      <div className="flex flex-col h-[calc(100vh-56px)] overflow-y-auto overflow-x-hidden">
        {PORTAL_NAV_SECTIONS.map((section) => (
          <div key={section.marker}>
            <div className="px-4 py-2 text-[10px] font-['JetBrains_Mono'] uppercase tracking-[0.4em] text-sl-mist/40">
              {section.marker}
            </div>
            {section.items.map((item) => (
              <button
                key={item.href}
                onClick={() => onSectionSelect(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group relative',
                  'hover:bg-sl-gold-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                  selectedSection === item.href
                    ? 'bg-sl-gold-subtle text-accent'
                    : 'text-sl-mist hover:text-sl-alabaster'
                )}
                type="button"
              >
                {selectedSection === item.href && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}
                <Icon name={item.icon} className="shrink-0" size={16} />
                {expanded && (
                  <span className="font-['JetBrains_Mono'] text-xs whitespace-nowrap transition-all duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      {!expanded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <span className="text-[10px] font-['JetBrains_Mono'] text-sl-silver opacity-50 tracking-widest uppercase">
            Hover
          </span>
        </div>
      )}
    </nav>
  );
}

interface PortalSidebarProps {
  className?: string;
}

function PortalSidebar(_props: PortalSidebarProps) {
  const { isSidebarOpen, setSidebarOpen } = usePortalStore();
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  const selectedSection = useMemo(() => pathname, [pathname]);

  return (
    <SidebarNav
      ref={navRef}
      expanded={isSidebarOpen}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
      onMouseDown={() => {}}
      onMouseMove={() => {}}
      selectedSection={selectedSection}
      onSectionSelect={() => {}}
    />
  );
}

const PortalMobileSidebar = () => {
  const { isSidebarOpen, setSidebarOpen } = usePortalStore();
  const navRef = useRef<HTMLDivElement>(null);

  return (
    <div className="lg:hidden">
      <SidebarNav
        ref={navRef}
        expanded={isSidebarOpen}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        onMouseDown={() => {}}
        onMouseMove={() => {}}
        selectedSection="/portal"
        onSectionSelect={() => {}}
      />
    </div>
  );
};

export { PortalSidebar, PortalMobileSidebar };
export { PORTAL_NAV_SECTIONS };
export type { PortalNavSection, PortalNavItem };
