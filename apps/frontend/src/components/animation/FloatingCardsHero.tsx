'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { getGsap } from '@/lib/gsap';
import { LetterBounceText } from './LetterBounceText';
import type gsap from 'gsap';

interface FloatingCard {
  id: string;
  image?: string;
  label?: string;
  rot: number;
  depth: number;
  className?: string;
}

interface FloatingCardsHeroProps {
  headline: string;
  highlight: string;
  subline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  cards?: FloatingCard[];
  className?: string;
}

const DEFAULT_CARDS: FloatingCard[] = [
  { id: 'card-1', rot: -9, depth: 14, className: 'w-[140px] h-[200px] sm:w-[180px] sm:h-[250px] top-[12%] left-[4%] max-sm:left-[2%]' },
  { id: 'card-2', rot: 7, depth: 10, className: 'w-[120px] h-[170px] sm:w-[150px] sm:h-[210px] top-[8%] right-[4%] max-sm:right-[2%]' },
  { id: 'card-3', rot: -5, depth: 18, className: 'w-[100px] h-[150px] sm:w-[130px] sm:h-[190px] bottom-[18%] left-[6%] max-sm:bottom-[25%]' },
  { id: 'card-4', rot: 11, depth: 12, className: 'w-[130px] h-[190px] sm:w-[170px] sm:h-[240px] bottom-[12%] right-[3%] max-sm:bottom-[20%]' },
];

export function FloatingCardsHero({
  headline,
  highlight,
  subline,
  ctaLabel = 'Explore Works',
  ctaHref = '/projects',
  cards = DEFAULT_CARDS,
  className,
}: FloatingCardsHeroProps) {
  const { staticMode, finePointer } = useMotionPolicy();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const cardElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const gsapCtxRef = useRef<gsap.Context | null>(null);

  const getCard = useCallback((id: string) => cardElsRef.current.get(id) ?? null, []);

  useEffect(() => {
    if (staticMode) return;

    let cancelled = false;

    (async () => {
      const gsap = await getGsap();
      if (cancelled || !sectionRef.current) return;

      const { ScrollTrigger } = await import('gsap/ScrollTrigger');

      // Create a gsap context for automatic cleanup
      const ctx = gsap.context(() => {
        const section = sectionRef.current;
        const headlineEl = headlineRef.current;
        const sublineEl = sublineRef.current;

        if (!section) return;

        /* ── Word-by-word headline ── */
        if (headlineEl) {
          const wordInners = headlineEl.querySelectorAll<HTMLSpanElement>('.word-inner');
          if (wordInners.length) {
            gsap.set(wordInners, { y: '105%' });
            gsap.to(wordInners, {
              y: '0%',
              duration: 0.9,
              stagger: 0.08,
              ease: 'power3.out',
              delay: 0.3,
            });
          }
        }

        /* ── Card intro ── */
        const cardEls: HTMLDivElement[] = [];
        cards.forEach((card) => {
          const el = getCard(card.id);
          if (!el) return;
          cardEls.push(el);
          gsap.set(el, { y: -800, rotation: card.rot + 25, opacity: 0, scale: 0.7 });
        });

        if (cardEls.length) {
          gsap.to(cardEls, {
            rotation: (i: number) => cards[i].rot,
            opacity: 1,
            scale: 1,
            y: 0,
            stagger: { each: 0.08, from: 'center' },
            duration: 1.2,
            ease: 'back.out(1.4)',
            delay: 0.6,
          });

          cardEls.forEach((el, i) => {
            const rot = cards[i].rot;
            gsap.to(el, {
              y: '+=20',
              rotation: rot + 1.5,
              duration: 3 + Math.random() * 2,
              yoyo: true,
              repeat: -1,
              ease: 'sine.inOut',
              delay: Math.random() * 0.5,
            });
          });
        }

        /* ── ScrollTrigger scrub exit ── */
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          onUpdate: (self) => {
            const p = self.progress;
            if (headlineEl) {
              gsap.set(headlineEl, { scale: 1 + 0.15 * p, opacity: 1 - 0.4 * p });
            }
            if (sublineEl) {
              gsap.set(sublineEl, { opacity: 1 - 1.5 * p });
            }
            cardEls.forEach((el, i) => {
              const angle = (i / cardEls.length) * Math.PI * 2;
              const dist = 120 * p;
              gsap.set(el, {
                x: Math.cos(angle + i) * dist * 0.5,
                y: Math.sin(angle + i) * dist * 0.3 - 60 * p,
                rotation: cards[i].rot + 15 * p,
                opacity: 1 - 0.6 * p,
              });
            });
          },
        });
      });

      if (cancelled) {
        ctx.revert();
        return;
      }
      gsapCtxRef.current = ctx;
    })();

    // Mouse parallax — only on fine pointer
    if (finePointer) {
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = {
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        };
      };

      const parallaxLoop = () => {
        if (cancelled) return;
        const { x, y } = mouseRef.current;
        cards.forEach((card) => {
          const el = getCard(card.id);
          if (!el) return;
          const depth = card.depth;
          el.style.translate = `${x * depth}px ${y * depth * 0.5}px`;
        });
        rafRef.current = requestAnimationFrame(parallaxLoop);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      rafRef.current = requestAnimationFrame(parallaxLoop);

      return () => {
        cancelled = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener('mousemove', handleMouseMove);
        gsapCtxRef.current?.revert();
      };
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gsapCtxRef.current?.revert();
    };
  }, [staticMode, finePointer, cards, getCard]);

  const headlineWords = headline.split(/(\s+)/).map((part, i) => {
    if (/^\s+$/.test(part)) return <span key={i}>&nbsp;</span>;
    return (
      <span key={i} className="word-wrap inline-block overflow-hidden">
        <span className="word-inner inline-block">{part}</span>
      </span>
    );
  });

  if (staticMode) {
    return (
      <section
        ref={sectionRef}
        className={cn('relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-obsidian px-4', className)}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            ref={(el) => { if (el) cardElsRef.current.set(card.id, el); }}
            className={cn('absolute rounded-xl border border-white/10 bg-surface', card.className)}
            style={card.image ? { backgroundImage: card.image, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/5 to-transparent" />
          </div>
        ))}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.1] mb-4">
            {headline} <span className="font-serif italic text-gold">{highlight}</span>
          </h1>
          {subline && (
            <p className="text-base md:text-lg text-white/40 font-light max-w-2xl mx-auto mb-8">{subline}</p>
          )}
          <Link href={ctaHref} className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold text-obsidian text-sm font-medium tracking-wider uppercase hover:bg-gold-light transition-colors">
            {ctaLabel}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn('relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-obsidian px-4', className)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-transparent to-obsidian pointer-events-none z-[1]" />

      {cards.map((card) => (
        <div
          key={card.id}
          ref={(el) => { if (el) cardElsRef.current.set(card.id, el); }}
          className={cn(
            'card absolute rounded-xl border border-white/[0.06] cursor-pointer select-none overflow-hidden',
            'will-change-transform',
            card.className,
          )}
          style={
            card.image
              ? { backgroundImage: card.image, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(255,255,255,0.02))' }
          }
          data-rot={card.rot}
          data-depth={card.depth}
          onMouseMove={(e) => {
            if (!finePointer) return;
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            void getGsap().then((g) => {
              g.to(el, {
                rotateX: -py * 16,
                rotateY: px * 16,
                scale: 1.12,
                transformPerspective: 700,
                overwrite: 'auto',
                duration: 0.4,
                ease: 'power2.out',
              });
            });
          }}
          onMouseLeave={(e) => {
            void getGsap().then((g) => {
              g.to(e.currentTarget, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                transformPerspective: 700,
                duration: 0.6,
                ease: 'power2.out',
              });
            });
          }}
          onClick={(e) => {
            void getGsap().then((g) => {
              g.fromTo(e.currentTarget, { scale: 1.15 }, { scale: 1.05, yoyo: true, repeat: 1, duration: 0.15, ease: 'power2.inOut' });
            });
          }}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
          {card.label && (
            <div
              className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-md text-[10px] text-white/70 opacity-0 transition-opacity duration-300"
              style={{ background: 'rgba(20,10,6,0.7)', backdropFilter: 'blur(6px)' }}
            >
              {card.label}
            </div>
          )}
        </div>
      ))}

      <div className="relative z-10 text-center max-w-4xl mx-auto pointer-events-none">
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[1.1] mb-4 flex flex-wrap items-baseline justify-center gap-x-3"
        >
          {headlineWords}
          <LetterBounceText
            tag="span"
            className="font-serif italic text-gold"
            stagger={0.05}
            duration={1.2}
            delay={0.8}
          >
            {highlight}
          </LetterBounceText>
        </h1>

        {subline && (
          <p ref={sublineRef} className="text-base md:text-lg text-white/40 font-light max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
            {subline}
          </p>
        )}

        <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ctaHref}
            className="nav-cta inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold text-obsidian text-sm font-medium tracking-wider uppercase hover:bg-gold-light transition-colors"
            onClick={(e) => {
              void getGsap().then((g) => {
                g.fromTo(e.currentTarget, { scale: 1 }, { scale: 0.93, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' });
              });
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
