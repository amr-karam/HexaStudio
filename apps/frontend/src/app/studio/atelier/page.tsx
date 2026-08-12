'use client';

import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

/* -------------------------------------------------------------------------- */
/*  Reveal — scroll-triggered fade-up.                                        */
/*  Native IntersectionObserver (no animation library). The keyframes live in */
/*  globals.css (`.atelier-reveal`) and stagger is applied via animation-     */
/*  delay. The hidden state is only applied after the client runtime is       */
/*  active, so content is never invisible without JavaScript.                 */
/* -------------------------------------------------------------------------- */

function Reveal({
  children,
  delay = 0,
  className = '',
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div
      {...rest}
      ref={ref}
      className={clsx(
        'relative',
        isActive && 'atelier-reveal',
        isActive && isVisible && 'is-visible',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GlassButton — spring-driven CTA (kept on @react-spring/web).              */
/*  Visual styling is fully token-based; the spring only drives transform     */
/*  and opacity. Respects prefers-reduced-motion.                             */
/* -------------------------------------------------------------------------- */

function GlassButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [isHover, setHover] = useState(false);
  const [isReducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const { scale, opacity } = useSpring({
    scale: isHover && !isReducedMotion ? 1.04 : 1,
    opacity: isHover ? 1 : 0.92,
    config: { mass: 0.6, tension: 60, friction: 26 },
  });

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    document
      .getElementById('atelier-craft')
      ?.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <animated.button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        transform: scale.interpolate((value) => `scale(${value})`),
        opacity,
      }}
      className={clsx(
        'group relative inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full border border-accent/40 bg-accent/10 px-10 py-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.3em] text-accent backdrop-blur-md transition-colors duration-500 hover:border-accent/70 hover:bg-accent/15 focus-luxury',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/80 to-transparent"
      />
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rotate-45 bg-accent transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover:rotate-[135deg]"
      />
      {children}
      <span
        aria-hidden="true"
        className="transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover:translate-x-1"
      >
        →
      </span>
    </animated.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Content data                                                              */
/* -------------------------------------------------------------------------- */

const cardItems = [
  {
    index: '01',
    label: 'Process',
    description: 'The rituals that transform intent into artifact',
  },
  {
    index: '02',
    label: 'Materials',
    description: 'Light, ink, geometry — the matter of digital making',
  },
  {
    index: '03',
    label: 'People',
    description: 'The hands and minds that shape the unseen',
  },
] as const;

const navItems = [
  { label: 'Return to Studio', href: '/studio' },
  { label: 'Explore Projects', href: '/projects' },
  { label: 'Creative Lab', href: '/shop' },
  { label: 'Collaborate', href: '/contact' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Page — The Digital Atelier                                                 */
/* -------------------------------------------------------------------------- */

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

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-sans text-foreground">
      {/* Ambient obsidian-and-gold wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.07)_0%,_transparent_65%)]"
      />

      <main className="relative flex min-h-screen flex-col">
        {/* Fixed header */}
        <header className="fixed inset-x-0 top-0 z-50">
          <div className="flex items-center justify-between border-b border-accent/10 bg-background/70 px-6 py-4 backdrop-blur-xl sm:px-10">
            <Link
              href="/studio"
              className="group flex items-center gap-3 rounded-sm focus-luxury"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rotate-45 bg-accent transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover:rotate-[135deg]"
              />
              <span className="font-serif text-base tracking-[0.3em] text-foreground sm:text-lg">
                HEXASTUDIO
              </span>
            </Link>
            <p className="hidden font-mono text-[0.625rem] uppercase tracking-[0.35em] text-neutral-500 sm:block">
              The Digital Atelier
            </p>
          </div>
        </header>

        {/* Hero — monument & drafting frame */}
        <section className="relative flex flex-col items-center px-6 pb-14 pt-32 sm:pt-40">
          {/* Architectural grid-line frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 bottom-6 top-24 hidden md:block"
          >
            <div className="absolute inset-0 border border-accent/10" />
            <div className="absolute -left-px -top-px h-10 w-10 border-l-2 border-t-2 border-accent/40" />
            <div className="absolute -right-px -top-px h-10 w-10 border-r-2 border-t-2 border-accent/40" />
            <div className="absolute -bottom-px -left-px h-10 w-10 border-b-2 border-l-2 border-accent/40" />
            <div className="absolute -bottom-px -right-px h-10 w-10 border-b-2 border-r-2 border-accent/40" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-accent/50" />
          </div>

          {/* Decorative serif numeral */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-20 hidden select-none font-serif text-[clamp(7rem,16vw,13rem)] leading-none text-accent/5 lg:block"
          >
            01
          </span>

          <Reveal className="flex flex-col items-center text-center">
            <p className="mb-8 flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
              <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
              The Studio · Working Draft
              <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            </p>

            <h1 className="max-w-4xl text-balance font-serif text-[clamp(2.75rem,7.5vw,7rem)] font-medium leading-[1.04] tracking-tight text-foreground">
              Creative{' '}
              <em className="text-gradient-gold font-normal italic">Atelier</em>
            </h1>

            <p className="mt-8 max-w-xl text-balance font-sans text-base leading-relaxed text-neutral-400 sm:text-lg">
              Where raw intent is cut, set, and polished into artifact.
              <span className="mt-2 block text-neutral-500">
                Every interaction writes form. Every pause reveals potential.
              </span>
            </p>
          </Reveal>

          <Reveal delay={160} className="mt-12 flex w-full max-w-xs items-center gap-4">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/40" />
            <span aria-hidden="true" className="h-2 w-2 rotate-45 border border-accent/60" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/40" />
          </Reveal>
        </section>

        {/* § 01 — The Elements */}
        <section aria-labelledby="atelier-elements" className="relative px-6 pt-20 sm:pt-28">
          <Reveal className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
              <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
              § 01 — The Elements
              <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
            </p>
            <h2
              id="atelier-elements"
              className="mt-5 font-serif text-3xl tracking-tight text-foreground sm:text-4xl"
            >
              Instruments of the{' '}
              <em className="text-gradient-gold font-normal italic">Atelier</em>
            </h2>
          </Reveal>

          <div className="mx-auto mt-12 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {cardItems.map((item, index) => (
              <Reveal key={item.label} delay={index * 140} className="h-full">
                <article className="group artisan-glass artisan-specular-top relative flex h-full flex-col overflow-hidden rounded-2xl p-7 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-700 ease-[var(--hexa-ease-interaction)] group-hover:opacity-100"
                  />
                  <span className="font-mono text-[0.625rem] uppercase tracking-[0.35em] text-accent/60">
                    № {item.index}
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-foreground">{item.label}</h3>
                  <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-neutral-400">
                    {item.description}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 self-start font-mono text-[0.625rem] uppercase tracking-[0.3em] text-neutral-500 transition-colors duration-500 group-hover:text-accent">
                    Explore
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-500 ease-[var(--hexa-ease-interaction)] group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="flex justify-center px-6 pt-20">
          <Reveal delay={120}>
            <GlassButton>Enter The Atelier</GlassButton>
          </Reveal>
        </div>

        {/* § 02 — On Craft */}
        <section
          id="atelier-craft"
          aria-labelledby="atelier-craft-title"
          className="relative scroll-mt-24 px-6 pb-16 pt-28 sm:pt-36"
        >
          <div className="mx-auto w-full max-w-5xl">
            <Reveal>
              <div className="artisan-glass-gold artisan-specular-top relative overflow-hidden rounded-3xl p-8 md:p-14">
                <p className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.4em] text-accent/70">
                  <span aria-hidden="true" className="h-px w-8 bg-accent/50" />
                  § 02 — On Craft
                </p>

                <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-2 md:gap-14">
                  {/* Column 1 — narrative */}
                  <div>
                    <h2
                      id="atelier-craft-title"
                      className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
                    >
                      The Nature of{' '}
                      <em className="text-gradient-gold font-normal italic">Making</em>
                    </h2>
                    <p className="drop-cap mt-7 font-sans leading-relaxed text-neutral-300">
                      True creation lives in the tension between control and surrender — between
                      the precise intention and the happy accident that reveals new possibilities.
                    </p>
                    <p className="mt-5 font-sans leading-relaxed text-neutral-400">
                      In this atelier, we don&apos;t just build interfaces. We cultivate
                      environments where creative emergence becomes inevitable. Each project is a
                      collaboration between human intention and digital possibility.
                    </p>
                  </div>

                  {/* Column 2 — craft notes */}
                  <div className="space-y-6">
                    <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-6 md:p-8">
                      <h3 className="font-serif text-xl text-foreground md:text-2xl">
                        From Trace to{' '}
                        <em className="text-gradient-gold font-normal italic">Artifact</em>
                      </h3>
                      <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-400">
                        What begins as a fleeting interaction becomes, through attention and
                        iteration, a lasting artifact — not despite its process, but because of it.
                      </p>
                    </div>

                    <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-6 md:p-8">
                      <h3 className="font-serif text-xl text-foreground md:text-2xl">
                        Materials of{' '}
                        <em className="text-gradient-gold font-normal italic">Thought</em>
                      </h3>
                      <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-400">
                        Like a master artisan working with physical media, the digital creator
                        shapes not just pixels but possibilities — light becomes structure,
                        movement becomes meaning.
                      </p>
                    </div>

                    <div className="artisan-glass artisan-specular-top relative overflow-hidden rounded-2xl p-6 md:p-8">
                      <h3 className="font-serif text-xl text-foreground md:text-2xl">
                        The Alchemy of{' '}
                        <em className="text-gradient-gold font-normal italic">Collaboration</em>
                      </h3>
                      <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-400">
                        The best work emerges when diverse perspectives converge — designers,
                        engineers, strategists, and dreamers each bringing their unique lens to
                        the creative cauldron.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Navigation footer */}
            <Reveal delay={120}>
              <nav
                aria-label="Studio navigation"
                className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-accent/10 pt-10"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group inline-flex items-center gap-2 rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.25em] text-neutral-400 transition-colors duration-300 hover:text-accent focus-luxury"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rotate-45 bg-accent/40 transition-colors duration-300 group-hover:bg-accent"
                    />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Reveal>
          </div>
        </section>

        {/* Footer credit */}
        <footer className="mt-16 flex justify-center px-6 pb-14">
          <p className="flex items-center justify-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.35em] text-neutral-600">
            <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-accent/40" />
            Crafted with artisan processes
          </p>
        </footer>
      </main>

      {/* Scroll progress indicator */}
      <div
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
        className="fixed inset-x-0 bottom-0 z-50 h-[3px] bg-background/80"
      >
        <div
          className="h-full bg-gradient-to-r from-accent-dark via-accent to-accent-light shadow-[0_0_10px_rgba(212,175,55,0.45)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}
