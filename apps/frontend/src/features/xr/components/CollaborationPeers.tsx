'use client';

import { useXRStore } from '../store/xr-store';

export function CollaborationPeers() {
  const collaborators = useXRStore((s) => s.collaborators);
  const peers = Object.values(collaborators);

  if (peers.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-16 right-4 z-[55] flex flex-col gap-2">
      {peers.map((peer) => (
        <div
          key={peer.id}
          className="rounded-full bg-void/80 border border-white/10 px-3 py-1.5 text-xs font-medium text-sl-alabaster/80 shadow-lg backdrop-blur-sm"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sl-gold-subtle mr-2" />
          {peer.user || peer.id.slice(0, 8)} · {peer.mode?.toUpperCase() || 'AR'}
        </div>
      ))}
    </div>
  );
}
