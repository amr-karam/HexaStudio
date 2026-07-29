// ─── HEXA Hub — PWA Manifest Metadata Route ────────────────────────────────
// Next.js Metadata Route API that serves the web app manifest.
// Enables PWA installability: standalone mode, themed splash screen, custom icons.
// ───────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HEXA Hub',
    short_name: 'HEXA Hub',
    description: 'Enterprise Workspace for HEXA Studio',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
