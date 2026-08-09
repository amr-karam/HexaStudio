'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useQualityTier } from '@/providers/quality-provider';

/**
 * BookProgress — right-edge reading progress indicator.
 *
 * Styled like a stack of book pages or a bookmark ribbon.
 * Shows which chapter "page" the reader is currently on.
 * Updates via IntersectionObserver as chapters enter/exit the viewport.
 */
const CHAPTERS = [
  { id: 'ch-vision', label: 'Vision' },
  { id: 'ch-craft', label: 'Craft' },
  { id: 'ch-method', label: 'Method' },
  { id: 'ch-proof', label: 'Proof' },
  { id: 'ch-contact', label: 'Contact' },
];

export function BookProgress() {
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { tier } = useQualityTier();
  const isLowTier = tier.level === 'low';

  const updateActive = useCallback((entries: IntersectionObserverEntry[]) => {
    // Find the last chapter whose top edge has crossed the 60% viewport mark
    let newIndex = 0;
    for (const entry of entries) {
      const chapter = CHAPTERS.find((c) => c.id === entry.target.id);
      if (!chapter) continue;
      const chapterIndex = CHAPTERS.indexOf(chapter);
      if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
        newIndex = Math.max(newIndex, chapterIndex);
      }
    }
    setActiveIndex(newIndex);
  }, []);

  useEffect(() => {
    if (isLowTier || typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      updateActive,
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.3, 0.5, 0.7, 1],
      },
    );

    CHAPTERS.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isLowTier, updateActive]);

  return (
    <nav
      aria-label="Reading progress"
      style={{
        position: 'fixed',
        right: 'clamp(16px, 3vw, 40px)',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        zIndex: 50,
      }}
    >
      {CHAPTERS.map((chapter, i) => {
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex;

        return (
          <button
            key={chapter.id}
            onClick={() => {
              const el = document.getElementById(chapter.id);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={`Chapter ${i + 1}: ${chapter.label}${isActive ? ' (current)' : ''}`}
            aria-current={isActive ? 'step' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              outline: 'none',
            }}
          >
            {/* Page stack indicator */}
            <span
              aria-hidden="true"
              style={{
                width: '18px',
                height: '22px',
                borderRadius: '1px',
                border: isActive
                  ? '1.5px solid rgba(212, 175, 55, 0.7)'
                  : '1px solid rgba(255,255,255,0.12)',
                background: isActive
                  ? 'rgba(212, 175, 55, 0.12)'
                  : isCompleted
                  ? 'rgba(212, 175, 55, 0.08)'
                  : 'rgba(255,255,255,0.03)',
                boxShadow: isActive
                  ? '0 0 12px rgba(212, 175, 55, 0.15)'
                  : 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isActive ? 'translateX(-2px)' : 'translateX(0)',
                position: 'relative',
              }}
            >
              {/* Page curl on active */}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: '-3px',
                    right: '-3px',
                    width: '8px',
                    height: '8px',
                    borderRight: '1px solid rgba(212, 175, 55, 0.3)',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'rgba(0,0,0,0.3)',
                    transform: 'rotate(45deg)',
                  }}
                />
              )}
              {/* Page lines */}
              <span
                style={{
                  position: 'absolute',
                  left: '3px',
                  top: '5px',
                  width: '10px',
                  height: '1px',
                  background: isActive
                    ? 'rgba(212, 175, 55, 0.4)'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '3px',
                  top: '9px',
                  width: '8px',
                  height: '1px',
                  background: isActive
                    ? 'rgba(212, 175, 55, 0.25)'
                    : 'rgba(255,255,255,0.06)',
                }}
              />
            </span>

            {/* Chapter label */}
            <span
              style={{
                fontSize: 'clamp(0.55rem, 1vw, 0.7rem)',
                fontFamily: '"Playfair Display", serif',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: isActive
                  ? 'rgba(212, 175, 55, 0.9)'
                  : isCompleted
                  ? 'rgba(255,255,255,0.4)'
                  : 'rgba(255,255,255,0.2)',
                transition: 'color 0.4s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {chapter.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
