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
  Hash,
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
  Sparkles,
  Briefcase,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

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
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Hash, label: 'Channels', href: '/dashboard/channels' },
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

function SidebarNavItem({
  item,
  pathname,
  isExpanded,
  onToggleExpand,
}: {
  item: NavItem;
  pathname: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    pathname === item.href ||
    (hasChildren && item.children?.some((child) => pathname === child.href));

  return (
    <div>
      <div className="relative">
        {hasChildren ? (
          <button
            onClick={onToggleExpand}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-300 relative group ${
              isActive
                ? 'bg-gold/10 text-gold'
                : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
            }`}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="text-sm font-light tracking-wide flex-1 text-left">{item.label}</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-neutral-600" />
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group ${
              isActive
                ? 'bg-gold/10 text-gold'
                : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
            }`}
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
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-9 pr-2 py-1 space-y-0.5">
              {item.children?.map((child) => {
                const isChildCurrentlyActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-light tracking-wide transition-all duration-200 relative ${
                      isChildCurrentlyActive
                        ? 'text-gold bg-gold/5'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isChildCurrentlyActive && (
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
    // Auto-expand Sales group if child is active
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
    <aside className="w-64 h-screen bg-[#0A0A0A] border-r border-[#1F1F1F] flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 mb-2">
        <h2 className="text-xl font-serif font-light tracking-tighter text-white">
          HEXA <span className="text-[#D4A843]">HUB</span>
        </h2>
      </div>

      {/* Search Button */}
      <div className="px-3 mb-3">
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm text-neutral-500 bg-white/[0.02] border border-[#1F1F1F]/50 hover:border-[#D4A843]/20 hover:text-neutral-300 hover:bg-white/[0.04] transition-all duration-300 group"
        >
          <Search size={16} className="text-[#555] group-hover:text-[#D4A843]/70 transition-colors shrink-0" />
          <span className="font-light tracking-wide text-left flex-1">Search...</span>
          <kbd className="hidden group-hover:inline-flex text-[10px] text-[#444] bg-[#1A1A1A] px-1.5 py-0.5 rounded font-mono border border-[#1F1F1F]/50">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin">
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
          <div className="pt-4 mt-4 border-t border-[#1F1F1F]/50">
            <span className="px-4 text-[10px] uppercase tracking-[0.2em] text-[#666] mb-2 block font-medium">
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
      <div className="p-3 border-t border-[#1F1F1F]">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-[#141414]/50">
          <div className="w-8 h-8 rounded-full bg-[#1F1F1F] flex items-center justify-center text-[#888] shrink-0">
            <User size={16} />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-[10px] text-[#666] uppercase tracking-[0.15em] truncate">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#666] hover:text-red-400 transition-colors duration-300 rounded-lg hover:bg-white/[0.02]"
        >
          <LogOut size={16} />
          <span className="font-light tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
