'use client';

import React from 'react';
import { LayoutDashboard, BrainCircuit, TrendingUp, Users, AlertCircle, FolderKanban } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import ExecutiveDashboard from './page';

export default function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-white">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-serif font-light">Access Restricted</h1>
          <p className="text-neutral-500 font-light">This area is reserved for Executive leadership.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
