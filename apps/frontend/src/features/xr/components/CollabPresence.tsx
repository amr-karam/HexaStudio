'use client';

import { useXRStore } from '../store/xr-store';

export function CollabPresence() {
  const collaborators = useXRStore((s) => s.collaborators);
  const connected = useXRStore((s) => s.collabConnected);
  const peers = Object.values(collaborators);
  const total = peers.length + 1;

  return (
    <div className="pointer-events-none fixed bottom-4 end-4 z-50 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
      <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span className="text-xs text-white/60">
        {connected ? `${total} in session` : 'Offline'}
      </span>
      {peers.length > 0 && (
        <div className="flex -space-x-1">
          {peers.slice(0, 4).map((peer) => (
            <div
              key={peer.id}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[9px] font-medium text-[#D4AF37] ring-1 ring-black"
              title={peer.user}
            >
              {peer.user.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
