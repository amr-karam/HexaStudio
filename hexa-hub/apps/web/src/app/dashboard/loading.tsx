'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[#050505]">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-[#1F1F1F] p-6 space-y-3 animate-pulse">
        <div className="h-6 bg-[#1F1F1F] rounded w-32 mb-8" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-9 bg-[#1F1F1F]/60 rounded-lg" style={{ width: `${80 - i * 3}%` }} />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-8 md:p-12 space-y-6 animate-pulse">
        <div className="h-10 bg-[#1F1F1F] rounded w-64" />
        <div className="h-4 bg-[#1F1F1F] rounded w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#1F1F1F]/60 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
