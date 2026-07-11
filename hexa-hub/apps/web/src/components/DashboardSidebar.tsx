'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FolderKanban, 
  Settings, 
  LogOut,
  User 
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: FolderKanban, label: 'Projects', href: '/dashboard/projects' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col">
      <div className="p-6 mb-8">
        <h2 className="text-xl font-serif font-light tracking-tighter text-white">
          HEXA <span className="text-gold">HUB</span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-gold/10 text-gold' 
                  : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
              }`}
            >
              <item.icon size={20} />
              <span className="text-sm font-light tracking-wide">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-pill" 
                  className="absolute left-0 w-1 h-6 bg-gold rounded-r-full" 
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
            <User size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-500 hover:text-red-400 transition-colors duration-300"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
