'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface Props {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const maskImage = (progress: number) => {
  const cx = 50 + Math.sin(progress * Math.PI) * 0;
  const cy = 50;
  const r = progress * 72;
  return `radial-gradient(circle ${r}% at ${cx}% ${cy}%, black 50%, transparent 70%)`;
};

export default function ProgressiveReveal({
  src,
  alt,
  className,
  delay = 0,
  duration = 1.2,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('revealed');
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className ?? ''}`}
      initial="hidden"
      animate={controls}
    >
      {/* Wireframe overlay */}
      <motion.div
        className="absolute inset-0 z-10"
        variants={{
          hidden: { opacity: 1 },
          revealed: { opacity: 0, transition: { delay: delay + duration * 0.7, duration: 0.4 } },
        }}
      >
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(2) brightness(0.6) saturate(0)',
            mixBlendMode: 'screen',
          }}
        />
        {/* Scan lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,175,55,0.15) 2px, rgba(212,175,55,0.15) 4px)',
            backgroundSize: '100% 4px',
          }}
        />
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${src.slice(-8)}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${src.slice(-8)})`} />
        </svg>
      </motion.div>

      {/* Color reveal mask */}
      <motion.div
        className="absolute inset-0 z-20"
        variants={{
          hidden: { WebkitMaskImage: maskImage(0), maskImage: maskImage(0), opacity: 0 },
          revealed: {
            WebkitMaskImage: maskImage(1),
            maskImage: maskImage(1),
            opacity: 1,
            transition: { delay, duration, ease: [0.7, 0, 0.3, 1] },
          },
        }}
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        {/* Gold glow border during reveal */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={{
            hidden: { opacity: 0.4 },
            revealed: { opacity: 0, transition: { delay: delay + duration * 0.6, duration: 0.5 } },
          }}
          style={{
            boxShadow: 'inset 0 0 60px rgba(212,175,55,0.25)',
          }}
        />
      </motion.div>

      {/* Placeholder */}
      <img src={src} alt={alt} className="w-full h-full object-cover opacity-10" aria-hidden />
    </motion.div>
  );
}
