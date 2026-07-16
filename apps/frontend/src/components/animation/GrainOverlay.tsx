'use client';

interface GrainOverlayProps {
  opacity?: number;
  blendMode?: 'multiply' | 'overlay' | 'screen' | 'soft-light';
  zIndex?: number;
}

export function GrainOverlay({
  opacity = 0.06,
  blendMode = 'multiply',
  zIndex = 100,
}: GrainOverlayProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex,
        opacity,
        mixBlendMode: blendMode,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}
    />
  );
}
