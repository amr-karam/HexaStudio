'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Contact,
  FileText,
  FolderKanban,
  CheckSquare,
  Folder,
  MessageSquare,
  Bell,
  Settings,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  LogOut,
  User,
  Activity,
  HelpCircle,
  Calendar,
  Clock,
  BookOpen,
  Bot,
  Briefcase,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { hexaEasing, hexaDuration } from '@/lib/motion/tokens';
import { cn } from '@/components/ui/cn';

interface NavChild {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'CRM', href: '/dashboard/crm' },
  { icon: Contact, label: 'Contacts', href: '/dashboard/contacts' },
  {
    icon: FileText,
    label: 'Sales',
    href: '/dashboard/sales',
    children: [
      { icon: FileText, label: 'Quotations', href: '/dashboard/sales/quotations' },
      { icon: FileText, label: 'Invoices', href: '/dashboard/sales/invoices' },
    ],
  },
  { icon: FolderKanban, label: 'Projects', href: '/dashboard/projects' },
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks' },
  { icon: Folder, label: 'Documents', href: '/dashboard/documents' },
  { icon: BookOpen, label: 'Accounting', href: '/dashboard/accounting' },
  { icon: HelpCircle, label: 'Helpdesk', href: '/dashboard/helpdesk' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Users, label: 'Employees', href: '/dashboard/employees' },
  { icon: Clock, label: 'Timesheets', href: '/dashboard/timesheets' },
  { icon: BookOpen, label: 'Knowledge', href: '/dashboard/knowledge' },
  { icon: MessageSquare, label: 'Communication Center', href: '/dashboard/messages' },
  { icon: ShieldCheck, label: 'Approvals', href: '/dashboard/approvals' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Bot, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
  { icon: Briefcase, label: 'Portal', href: '/dashboard/portal' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const executiveItems: NavItem[] = [
  { icon: TrendingUp, label: 'Executive View', href: '/dashboard/executive' },
  { icon: Activity, label: 'Sync Status', href: '/dashboard/sync-status' },
];

interface SidebarNavItemProps {
  item: NavItem;
  pathname: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function SidebarNavItem({ item, pathname, isExpanded, onToggleExpand }: SidebarNavItemProps) {
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const isActive =
    pathname === item.href ||
    (hasChildren && item.children?.some((child) => pathname === child.href));

  const activeCls = 'bg-gold/10 text-gold';
  const inactiveCls = 'text-tertiary hover:bg-white/[0.03] hover:text-secondary';

  return (
    <div>
      <div className="relative">
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
              isActive ? activeCls : inactiveCls,
            )}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="text-sm font-light tracking-wide flex-1 text-left">{item.label}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: hexaDuration.micro, ease: hexaEasing.sharp }}
            >
              <ChevronDown size={14} className="text-tertiary" />
            </motion.div>
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute left-0 w-[3px] h-6 bg-gold rounded-r-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
              isActive ? activeCls : inactiveCls,
            )}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="text-sm font-light tracking-wide">{item.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute left-0 w-[3px] h-6 bg-gold rounded-r-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: hexaDuration.micro, ease: hexaEasing.sharp }}
            className="overflow-hidden"
          >
            <div className="pl-9 pr-2 py-1 space-y-0.5">
              {item.children?.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-light tracking-wide',
                      'transition-all duration-200 relative',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold',
                      isChildActive
                        ? 'text-gold bg-gold/5'
                        : 'text-tertiary hover:text-secondary hover:bg-white/[0.03]',
                    )}
                  >
                    {isChildActive && (
                      <motion.div
                        layoutId="nav-child-pill"
                        className="absolute left-0 w-[2px] h-4 bg-gold/70 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span>{child.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DashboardSidebarProps {
  onSearchOpen?: () => void;
}

export function DashboardSidebar({ onSearchOpen }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const salesItem = navItems.find((item) => item.children);
    if (salesItem?.children?.some((child) => pathname === child.href)) {
      return { [salesItem.href]: true };
    }
    return {};
  });

  const toggleGroup = (href: string) => {
    setExpandedGroups((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside className="w-64 h-screen bg-void-deep border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 mb-2">
        <h2 className="text-xl font-serif font-light tracking-tighter text-foreground">
          HEXA <span className="text-gold">HUB</span>
        </h2>
      </div>

      {/* Search Button */}
      <div className="px-3 mb-3">
        <button
          onClick={onSearchOpen}
          className={cn(
            'flex items-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm',
            'bg-white/[0.02] border border-border/50',
            'hover:border-gold/20 hover:text-secondary hover:bg-white/[0.04]',
            'transition-all duration-300 group',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold',
          )}
        >
          <Search size={16} className="text-tertiary group-hover:text-gold transition-colors shrink-0" />
          <span className="font-light tracking-wide text-left flex-1">Search…</span>
          <kbd className="hidden group-hover:inline-flex text-[10px] text-tertiary bg-surface-elevated px-1.5 py-0.5 rounded font-mono border border-border/50">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            isExpanded={expandedGroups[item.href] ?? false}
            onToggleExpand={() => toggleGroup(item.href)}
          />
        ))}

        {/* Executive Section — Admin Only */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="pt-4 mt-4 border-t border-border/50">
            <span className="px-4 text-[10px] uppercase tracking-[0.2em] text-tertiary mb-2 block font-medium">
              Executive
            </span>
            <div className="space-y-0.5">
              {executiveItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  isExpanded={false}
                  onToggleExpand={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 mb-2 rounded-lg',
          'bg-surface-elevated/50 border border-border/30',
        )}>
          <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-tertiary shrink-0">
            <User size={16} />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-[10px] text-tertiary uppercase tracking-[0.15em] truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-2.5 text-sm text-tertiary',
            'hover:text-error rounded-lg',
            'hover:bg-error/5 transition-all duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error',
          )}
        >
          <LogOut size={16} />
          <span className="font-light tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
