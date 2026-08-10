'use client';

import { animated, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { useState, useEffect, type CSSProperties } from 'react';

function GlassButton({ 
  children, 
  onClick, 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
}) {
  const [isHover, setHover] = useState(false);
  
  const { scale, opacity } = useSpring({
    scale: isHover ? 1.03 : 1,
    opacity: isHover ? 1 : 0.9,
    config: { mass: 0.6, tension: 40, friction: 26 }
  });

  const baseStyle: CSSProperties = {
    cursor: 'pointer',
    background: 'rgba(212, 175, 55, 0.2)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#fff',
    fontWeight: 700,
    textShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '13px 28px',
    margin: '0 auto',
    display: 'block',
    fontFamily: 'var(--type-preset-heading, system-ui)',
  };

  return (
    <animated.button
      style={{ 
        ...baseStyle,
        transform: scale.interpolate(s => `scale(${s})`),
        opacity,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className={className}
    >
      {children}
    </animated.button>
  );
}

const cardItems = [
  { label: 'Process', description: 'The rituals that transform intent into artifact' },
  { label: 'Materials', description: 'Light, ink, geometry — the matter of digital making' },
  { label: 'People', description: 'The hands and minds that shape the unseen' }
];

const navItems = [
  { label: 'Return to Studio', href: '/studio' },
  { label: 'Explore Projects', href: '/projects' },
  { label: 'Creative Lab', href: '/shop' },
  { label: 'Collaborate', href: '/contact' }
];

export default function CreativeAtelierPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollTop = window.scrollY;
        setScrollProgress((scrollTop / docHeight) * 100);
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden font-sans bg-slate-950 bg-[radial-gradient(circle_at_top,_rgba(18,18,20,0.95)_0%,_rgba(10,10,12,0.98)_70%)]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(18,18,20,0.5)_0%,_rgba(18,18,20,0.8)_70%)]" />
      <div className="absolute inset-0 bg-artisan-glass-gold/30 backdrop-blur-lg pointer-events-none" />
      <div className="absolute inset-0 bg-artisan-glass/50 backdrop-blur-lg pointer-events-none" />
      
      {/* Main content */}
      <main className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 px-6 z-50">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/studio" className="text-xl font-bold bg-gradient-to-r from-neutral-100 to-d4af37 bg-clip-text text-transparent transition-colors duration-300">
              HEXASTUDIO
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mt-20 flex flex-col items-center justify-center py-20">
          <h1 className="text-5xl lg:text-8xl font-bold text-center max-w-3xl">
            <span className="bg-gradient-to-r from-d4af37 to-neutral-100 bg-clip-text text-transparent">
              Creative Atelier
            </span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed text-center mb-10">
            Where digital creation manifests as visible process. 
            <span className="block text-neutral-400">Every interaction writes form. Every pause reveals potential.</span>
          </p>
        </section>

        {/* Interactive Elements Grid */}
        <section className="flex-1 flex flex-col items-center px-6">
          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
            {cardItems.map((item, index) => (
              <div
                key={item.label}
                className="group relative bg-artisan-glass/60 backdrop-blur-sm rounded-xl p-6 transition-all duration-500 border border-artisan-glass-border/30 hover:border-artisan-glass-border-hover hover:bg-artisan-glass-bg-hover cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-d4af37/30 flex items-center justify-center transition-all duration-500 group-hover:bg-d4af37 group-hover:scale-110">
                  <span className="text-d4af37 font-bold text-xl">{index + 1}</span>
                </div>
                <div className="mt-3 text-neutral-400 text-sm text-center group-hover:text-d4af37 transition-colors duration-300">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="pt-20">
            <GlassButton 
              onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
              className="px-10 py-3 bg-gradient-to-r from-d4af37 to-yellow-600 text-white font-bold rounded-xl shadow-xl transition-all duration-500"
            >
              Enter The Atelier
            </GlassButton>
          </div>
        </section>

        {/* Glass Content Section */}
        <section className="relative flex-1 py-20 px-6">
          <div className="max-w-5xl mx-auto w-full">
            {/* Glass Panel */}
            <div className="bg-artisan-glass/70 backdrop-blur-xl rounded-3xl border border-artisan-glass-border/30 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Column 1 */}
                <div>
                  <h2 className="text-3xl lg:text-5xl font-bold text-d4af37 mb-6">The Nature of Making</h2>
                  <p className="text-neutral-300 leading-relaxed mb-6">
                    True creation lives in the tension between control and surrender — between the precise intention and the happy accident that reveals new possibilities.
                  </p>
                  <p className="text-neutral-400">
                    In this atelier, we don't just build interfaces. We cultivate environments where creative emergence becomes inevitable. Each project is a collaboration between human intention and digital possibility.
                  </p>
                </div>
                
                {/* Column 2 */}
                <div className="space-y-6">
                  <div className="bg-artisan-glass/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-artisan-glass-border/30">
                    <h3 className="text-xl lg:text-2xl font-semibold text-d4af37 mb-3">From Trace to Artifact</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      What begins as a fleeting interaction becomes, through attention and iteration, a lasting artifact — not despite its process, but because of it.
                    </p>
                  </div>
                  
                  <div className="bg-artisan-glass/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-artisan-glass-border/30">
                    <h3 className="text-xl lg:text-2xl font-semibold text-d4af37 mb-3">Materials of Thought</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      Like a master artisan working with physical media, the digital creator shapes not just pixels but possibilities — light becomes structure, movement becomes meaning.
                    </p>
                  </div>
                  
                  <div className="bg-artisan-glass/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-artisan-glass-border/30">
                    <h3 className="text-xl lg:text-2xl font-semibold text-d4af37 mb-3">The Alchemy of Collaboration</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      The best work emerges when diverse perspectives converge — designers, engineers, strategists, and dreamers each bringing their unique lens to the creative cauldron.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-16 pt-8 border-t border-artisan-glass-border/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-neutral-300 hover:text-d4af37 transition-colors duration-300 flex items-center space-x-2 group"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Progress Indicator */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-artisan-glass/50 backdrop-blur-sm z-50 pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-d4af37 to-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Page scroll progress"
          />
        </div>
        
        {/* Footer Credit */}
        <footer className="absolute bottom-8 left-6 opacity-30 text-neutral-300 text-sm pointer-events-none">
          Crafted with artisan processes
        </footer>
      </main>
    </div>
  );
}