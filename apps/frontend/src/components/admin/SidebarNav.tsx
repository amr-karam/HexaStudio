'use client';

import { forwardRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  ref: React.RefObject<HTMLDivElement>;
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMouseDown: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  selectedSection: string;
  onSectionSelect: (section: string) => void;
}

type SectionIcon = 'palette' | 'file-text' | 'folder' | 'users' | 'shopping-cart' | 'receipt' | 'user-check' | 'upload';

interface NavItem {
  id: string;
  label?: string;
  icon?: SectionIcon;
  divider?: boolean;
}

const sections: NavItem[] = [
  { id: 'design', label: 'Design & Content', icon: 'palette' },
  { id: 'content', label: 'Content', icon: 'file-text' },
  { id: 'divider-project', divider: true },
  { id: 'projects', label: 'Odoo — Projects', icon: 'folder' },
  { id: 'crm', label: 'Odoo — CRM', icon: 'users' },
  { id: 'sales', label: 'Odoo — Sales', icon: 'shopping-cart' },
  { id: 'accounting', label: 'Odoo — Accounting', icon: 'receipt' },
  { id: 'team', label: 'Odoo — Team', icon: 'user-check' },
  { id: 'divider-upload', divider: true },
  { id: 'upload', label: 'Upload Centre', icon: 'upload' },
];

function Icon({ name, className }: { name: SectionIcon; className?: string }) {
  switch (name) {
    case 'palette':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.93.67-1.5 1.5-1.5H18c2.76 0 5-2.24 5-5 0-4.42-4.02-8-9-8z" />
        </svg>
      );
    case 'file-text':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'folder':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'users':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'shopping-cart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    case 'receipt':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2" /><path d="M16 16l-4-4-4 4" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case 'user-check':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case 'upload':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    default:
      return null;
  }
}

const SidebarNav = forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ expanded, onMouseEnter, onMouseLeave, onMouseDown, onMouseMove, selectedSection, onSectionSelect }, ref) => {
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
          {sections.map((section) =>
            ('divider' in section && section.divider) ? (
              <div key={section.id} className="h-px bg-sl-glass-border my-1" />
            ) : (
              <button
                key={section.id}
                onClick={() => onSectionSelect(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group relative',
                  'hover:bg-sl-gold-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
                  selectedSection === section.id
                    ? 'bg-sl-gold-subtle text-accent'
                    : 'text-sl-mist hover:text-sl-alabaster'
                )}
                type="button"
              >
                {/* Active indicator */}
                {selectedSection === section.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}

                {section.icon && <Icon name={section.icon} className="shrink-0" />}

                {expanded && (
                  <span className="font-['JetBrains_Mono'] text-xs whitespace-nowrap transition-all duration-300 animate-in fade-in slide-in-from-left-2 duration-300">
                    {section.label}
                  </span>
                )}
              </button>
            )
          )}
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
);

SidebarNav.displayName = 'SidebarNav';

export { SidebarNav };
