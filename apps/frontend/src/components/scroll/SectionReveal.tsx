'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getGsap } from '@/lib/gsap';
import { GSAP_EASING } from '@/lib/motion/tokens';
import { useMotionPolicy } from '@/hooks/useMotionPolicy';
import { useQualityTier } from '@/providers/quality-provider';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Pin duration as a multiple of viewport height (the hand-off window).
   * Default 1 — the next section takes one full viewport of scroll to
   * slide over the pinned one.
   */
  distance?: number;
}

/** Retreat transform of the pinned section while it is being covered. */
const RETREAT = { scale: 0.92, opacity: 0.25 } as const;
/** Leading-edge clip applied to the incoming section at hand-off start. */
const INCOMING_CLIP_START = 'inset(14% 0% 0% 0%)';
const INCOMING_CLIP_END = 'inset(0% 0% 0% 0%)';

/**
 * SectionReveal — pinned chapter hand-off (pasqua.it / agencidev.com DNA).
 *
 * The wrapped section pins at the viewport edge while the *next* sibling
 * section slides over it. During the overlap:
 * - the pinned content retreats (scale + fade, token easing, scrubbed with
 *   a 1s smooth catch-up);
 * - a gold hairline draws across the boundary;
 * - the incoming section's leading edge wipes open via `clip-path`
 *   (scrubbed inset reveal).
 *
 * Property discipline (hard rule): GSAP owns `clip-path` and the pinned
 * content's transform — framer-motion transforms inside children are never
 * targeted, so the two engines never write the same property on one node.
 *
 * Contract:
 * - Reduced motion / paused / quality tier `low`: renders children plainly —
 *   no pin, no scrub, content stacks normally.
 * - All ScrollTriggers live in a `gsap.context()` reverted on unmount;
 *   `ScrollTrigger.refresh()` fires after fonts/load so pin math stays true.
 * - `pinSpacing: false` is intentional: the overlap IS the effect. No layout
 *   shift at load time (CLS ≈ 0).
 */
export const SectionReveal = ({ children, className, distance = 1 }: SectionRevealProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLSpanElement>(null);
  const { staticMode } = useMotionPolicy();
  const { tier } = useQualityTier();

  const isStatic = staticMode || tier.level === 'low';

  useEffect(() => {
    if (isStatic) return;
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    let removeLoadListener: (() => void) | null = null;

    void (async () => {
      const [gsap, scrollTriggerModule] = await Promise.all([
        getGsap(),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      const { ScrollTrigger } = scrollTriggerModule;

      ctx = gsap.context(() => {
        const start = () =>
          root.offsetHeight >= window.innerHeight ? 'bottom bottom' : 'top top';
        const end = () => `+=${window.innerHeight * distance}`;

        // Pin the wrapped section; the next sibling covers it naturally.
        ScrollTrigger.create({
          trigger: root,
          start,
          end,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });

        // Pinned content retreats into the dark (token easing, smooth catch-up).
        gsap.to(content, {
          scale: RETREAT.scale,
          opacity: RETREAT.opacity,
          ease: GSAP_EASING.easeInOutQuint,
          scrollTrigger: { trigger: root, start, end, scrub: 1 },
        });

        // Gold hairline draws across the boundary.
        if (hairlineRef.current) {
          gsap.fromTo(
            hairlineRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: GSAP_EASING.easeOutExpo,
              scrollTrigger: { trigger: root, start, end, scrub: 1 },
            },
          );
        }

        // Incoming section: clip-path leading-edge wipe + stacking above the pin.
        const incoming = root.nextElementSibling as HTMLElement | null;
        if (incoming) {
          gsap.set(incoming, { position: 'relative', zIndex: 2, willChange: 'clip-path' });
          gsap.fromTo(
            incoming,
            { clipPath: INCOMING_CLIP_START },
            {
              clipPath: INCOMING_CLIP_END,
              ease: GSAP_EASING.easeInOutQuint,
              scrollTrigger: { trigger: root, start, end, scrub: 1 },
            },
          );
        }
      }, root);

      // Refresh once real fonts/images settle so pin distances stay true.
      const refresh = () => ScrollTrigger.refresh();
      if (document.fonts?.ready) {
        void document.fonts.ready.then(refresh).catch(() => undefined);
      }
      if (document.readyState !== 'complete') {
        window.addEventListener('load', refresh, { once: true });
        removeLoadListener = () => window.removeEventListener('load', refresh);
      }
    })();

    return () => {
      cancelled = true;
      removeLoadListener?.();
      ctx?.revert();
    };
  }, [isStatic, distance]);

  return (
    <div
      ref={rootRef}
      className={cn('relative z-[1]', className)}
      data-cursor="scroll"
      data-section-reveal=""
    >
      <div ref={contentRef} className="will-change-transform">
        {children}
      </div>
      {/* Boundary hairline — draws gold as the next chapter covers this one */}
      <span
        ref={hairlineRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-px origin-left bg-accent/60"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
};
