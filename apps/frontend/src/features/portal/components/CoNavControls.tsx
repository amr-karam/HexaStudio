'use client';

import React from 'react';
import { useXRStore } from '@/features/xr/store/xr-store';
import { motion, AnimatePresence } from 'framer-motion';

interface CoNavControlsProps {
  className?: string;
}

export function CoNavControls({ className }: CoNavControlsProps) {
  const {
    collaborators,
    collabConnected,
  } = useXRStore();

  const collaboratorList = Object.values(collaborators);

  return (
    <div className={`fixed top-6 right-6 z-50 flex flex-col gap-4 ${className}`}>
      {/* Participant Presence Overlay */}
      <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl min-w-[200px]">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Live Session</span>
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-1.5 rounded-full ${collabConnected ? 'bg-emerald-400' : 'bg-red-500'} animate-pulse`} />
            <span className="text-[10px] text-white/60 font-medium">
              {collabConnected ? 'Synced' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {collaboratorList.map((peer) => (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black text-[10px] font-bold flex items-center justify-center">
                    {peer.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/90 leading-tight">{peer.user}</span>
                    <span className="text-[9px] text-white/40 leading-tight">Exploring Space</span>
                  </div>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {collaboratorList.length === 0 && (
            <div className="text-center py-2 text-[10px] text-white/30 italic">
              Waiting for participants...
            </div>
          )}
        </div>
       </div>

       {/* Connection Health Indicator */}
       <div className="flex justify-center">
         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[9px] text-white/30 font-medium uppercase tracking-tighter">
           <span className={`h-1 w-1 rounded-full ${
             collabConnected ? 'bg-emerald-500' : 'bg-red-500'
           }`} />
           Network: {collabConnected ? 'Synced' : 'Offline'}
         </div>
       </div>
     </div>
  );
}
