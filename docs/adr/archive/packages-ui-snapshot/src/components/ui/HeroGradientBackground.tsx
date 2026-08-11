import type { ReactNode } from 'react';

interface HeroGradientBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const HeroGradientBackground = ({ children, className = '' }: HeroGradientBackgroundProps) => {
  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-50) 50%, var(--color-primary-500) 100%)',
      }}
    >
      {/* Subtle grain overlay for architectural texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />
      {/* Depth gradient for cinematic fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default HeroGradientBackground;
