'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-gold"
          aria-label="Loading"
        />
        <p className="text-sm text-secondary font-light">Loading…</p>
      </div>
    </div>
  );
}
