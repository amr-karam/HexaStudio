'use client';

import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-border p-6 space-y-3 animate-pulse">
        <div className="h-6 w-32 rounded bg-border mb-8" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-lg bg-border/60"
            style={{ width: `${80 - i * 3}%` }}
          />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-8 md:p-12 space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded bg-border" />
        <div className="h-4 w-96 rounded bg-border" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-border/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
