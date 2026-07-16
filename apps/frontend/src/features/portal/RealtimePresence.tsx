'use client';

import { useState, useEffect } from 'react';

interface RealtimePresenceProps {
  users: string[];
  isConnected: boolean;
}

export function RealtimePresence({ users, isConnected }: RealtimePresenceProps) {
  const unique = [...new Set(users)];

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span className="text-xs text-white/40">
        {isConnected ? `${unique.length} online` : 'Disconnected'}
      </span>
      {unique.length > 0 && (
        <div className="flex -space-x-1">
          {unique.slice(0, 5).map((user, i) => (
            <div
              key={i}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[9px] font-medium text-[#D4AF37] ring-1 ring-black"
              title={user}
            >
              {user.charAt(0).toUpperCase()}
            </div>
          ))}
          {unique.length > 5 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] text-white/40">
              +{unique.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
