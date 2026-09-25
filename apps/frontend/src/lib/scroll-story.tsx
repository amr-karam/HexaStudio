'use client';

import { useCallback, useMemo, useState, useEffect, useRef, type RefCallback } from 'react';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import type { Transition, Variants } from 'framer-motion';

/**
 * ChapterConfig — declarative configuration for a single chapter in a scroll story.
 */
export interface ChapterConfig<T = unknown> {
  /** Unique identifier — must match the section's DOM `id`. */
  id: string;
  /** Human-readable label for chapter rail / progress indicators. */
  label: string;
  /** Optional custom reveal configuration. */
  reveal?: {
    /** Root margin for IntersectionObserver. */
    rootMargin?: string;
    /** Threshold for triggering. */
    threshold?: number | number[];
    /** Custom entrance variants. */
    variants?: Variants;
    /** Custom transition. */
    transition?: Transition;
    /** Whether to trigger only once. */
    once?: boolean;
  };
  /** Optional data payload for this chapter (passed to render). */
  data?: T;
  /** Whether this chapter should be pinned (uses GSAP SectionReveal pattern). */
  pinned?: boolean;
  /** Pin distance as multiple of viewport height. */
  pinDistance?: number;
}

/**
 * ScrollStoryState — reactive state for the entire story.
 */
export interface ScrollStoryState {
  /** Current active chapter index (-1 = none). */
  activeIndex: number;
  /** Current active chapter ID. */
  activeChapterId: string | null;
  /** Normalized scroll progress (0–1). */
  scrollProgress: number;
  /** Scroll velocity (pixels/frame). */
  scrollVelocity: number;
  /** Whether reduced motion is active. */
  reduced: boolean;
  /** Ref callbacks for each chapter (attach to section elements). */
  chapterRefs: Map<string, RefCallback<HTMLElement>>;
  /** Reveal state for each chapter. */
  revealStates: Map<string, { hasRevealed: boolean; isIntersecting: boolean; ratio: number }>;
}

/**
 * ScrollStoryActions — imperative actions for controlling the story.
 */
export interface ScrollStoryActions {
  /** Scroll to a specific chapter. */
  scrollToChapter: (index: number, behavior?: ScrollBehavior) => void;
  /** Scroll to a specific chapter by ID. */
  scrollToChapterById: (id: string, behavior?: ScrollBehavior) => void;
  /** Go to next chapter. */
  nextChapter: () => void;
  /** Go to previous chapter. */
  prevChapter: () => void;
  /** Register a chapter ref manually (for dynamic chapters). */
  registerChapter: (id: string, ref: RefCallback<HTMLElement>) => void;
  /** Unregister a chapter. */
  unregisterChapter: (id: string) => void;
}

/**
 * ScrollStoryOptions — configuration for the ScrollStory orchestrator.
 */
export interface ScrollStoryOptions<T = unknown> {
  /** Ordered array of chapter configurations. */
  chapters: ChapterConfig<T>[];
  /** Root margin for global chapter detection. */
  rootMargin?: string;
  /** Whether to auto-advance active chapter based on scroll. */
  autoTrack?: boolean;
  /** Callback when active chapter changes. */
  onChapterChange?: (chapter: ChapterConfig<T>, index: number) => void;
}

/**
 * ScrollStoryResult — return value of the ScrollStory hook.
 */
export interface ScrollStoryResult<T = unknown> extends ScrollStoryState, ScrollStoryActions {
  /** Chapter configurations. */
  chapters: ChapterConfig<T>[];
  /** Get reveal variants for a specific chapter. */
  getChapterVariants: (index: number) => Variants;
  /** Get custom reveal config for a chapter. */
  getChapterRevealConfig: (index: number) => ChapterConfig<T>['reveal'];
}

/**
 * Internal state for chapter observation.
 */
interface ChapterObservationState {
  ref: RefCallback<HTMLElement>;
  isIntersecting: boolean;
  ratio: number;
  hasRevealed: boolean;
  observer: IntersectionObserver | null;
}

/**
 * ScrollStory — Deep module orchestrating multi-chapter scroll narratives.
 *
 * Interface: Single hook call with `chapters[]` config → returns unified state +
 * actions + Framer Motion variants for each chapter.
 *
 * Implementation:
 * - IntersectionObserver per chapter (via useIntersectionObserver)
 * - Global scroll progress + velocity (via useScrollProgress)
 * - Reduced-motion gating (via useHEXAMotion)
 * - GSAP SectionReveal integration for pinned chapters
 * - Chapter rail synchronization
 *
 * This module IS the seam between:
 * - Declarative chapter configuration (what the page author writes)
 * - Scroll detection & animation logic (what the motion system does)
 * - External consumers (chapter rail, analytics, navigation)
 *
 * One ScrollStory instance per page. Two+ pages = two adapters = real seam.
 */
export function useScrollStory<T = unknown>(
  options: ScrollStoryOptions<T>
): ScrollStoryResult<T> {
  const { chapters, rootMargin = '-20%', autoTrack = true, onChapterChange } = options;
  const { reduced } = useHEXAMotion();
  const scrollProgress = useScrollProgress();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());

  // Chapter observation state — managed internally, not via useIntersectionObserver hook
  // (to avoid calling hooks inside callbacks)
  const chapterObservations = useRef<Map<string, ChapterObservationState>>(new Map());
  const revealStates = useRef<Map<string, { hasRevealed: boolean; isIntersecting: boolean; ratio: number }>>(new Map());

  // Track scroll velocity
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      const deltaY = window.scrollY - lastScrollY.current;
      const deltaT = now - lastTime.current;
      if (deltaT > 0) {
        setScrollVelocity(Math.abs(deltaY / deltaT) * 1000); // px/s
      }
      lastScrollY.current = window.scrollY;
      lastTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-track active chapter based on intersection
  useEffect(() => {
    if (!autoTrack) return;

    let bestIndex = -1;
    let bestRatio = 0;

    revealStates.current.forEach((state, id) => {
      const idx = chapters.findIndex(c => c.id === id);
      if (idx >= 0 && state.isIntersecting && state.ratio > bestRatio) {
        bestRatio = state.ratio;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1 && bestIndex !== activeIndex) {
      setActiveIndex(bestIndex);
      onChapterChange?.(chapters[bestIndex], bestIndex);
    }
  }, [chapters, activeIndex, autoTrack, onChapterChange]);

  // Create chapter ref with IntersectionObserver
  const getChapterRef = useCallback((id: string): RefCallback<HTMLElement> => {
    const observation = chapterObservations.current.get(id);
    if (observation) return observation.ref;

    const chapter = chapters.find(c => c.id === id);
    const revealConfig = chapter?.reveal ?? {};

    // Create IntersectionObserver manually to avoid hook-in-callback
    const createObserver = (node: HTMLElement | null) => {
      const existing = chapterObservations.current.get(id);
      if (existing?.observer) {
        existing.observer.disconnect();
      }

      if (!node) {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const isIntersecting = entry.isIntersecting;
            const ratio = entry.intersectionRatio;

            // Update observation state
            chapterObservations.current.set(id, {
              ...chapterObservations.current.get(id)!,
              isIntersecting,
              ratio,
            });

            // Update reveal state for external consumption
            revealStates.current.set(id, {
              hasRevealed: revealStates.current.get(id)?.hasRevealed ?? false,
              isIntersecting,
              ratio,
            });

            if (isIntersecting) {
              revealStates.current.set(id, {
                ...revealStates.current.get(id)!,
                hasRevealed: true,
              });
            }
          });
        },
        {
          root: null,
          rootMargin: revealConfig.rootMargin ?? rootMargin,
          threshold: revealConfig.threshold ?? [0, 0.25, 0.5, 0.75, 1],
        }
      );

      observer.observe(node);
      chapterObservations.current.set(id, {
        ref: () => {},
        observer,
        isIntersecting: false,
        ratio: 0,
        hasRevealed: false,
      });
    };

    const ref: RefCallback<HTMLElement> = (node) => {
      if (!node) return;
      createObserver(node);
    };

    return ref;
  }, [chapters]);

  // Build refs map for external consumption
  const refsMap = useMemo(() => {
    const map = new Map<string, RefCallback<HTMLElement>>();
    chapters.forEach(c => map.set(c.id, getChapterRef(c.id)));
    return map;
  }, [chapters, getChapterRef]);

  // Build reveal states map for external consumption
  const revealMap = useMemo(() => {
    const map = new Map<string, { hasRevealed: boolean; isIntersecting: boolean; ratio: number }>();
    revealStates.current.forEach((v, k) => map.set(k, v));
    return map;
  }, [revealStates.current]);

  // Actions
  const scrollToChapter = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const chapter = chapters[index];
    if (!chapter) return;
    const element = document.getElementById(chapter.id);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }, [chapters]);

  const scrollToChapterById = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }, []);

  // Chapter variants getter
  const getChapterVariants = useCallback((index: number): Variants => {
    const chapter = chapters[index];
    if (!chapter) return {};

    const customVariants = chapter.reveal?.variants;
    if (customVariants) return customVariants;

    // Default: fade + lift with HEXA tokens
    return {
      hidden: { opacity: 0, y: 30 },
      visible: (custom?: unknown) =>
        custom === true || custom === undefined
          ? { opacity: 1, y: 0, transition: { duration: 0.01 } }
          : { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, y: 30, transition: { duration: 0.25 } },
    };
  }, [chapters]);

  const getChapterRevealConfig = useCallback((index: number): ChapterConfig<T>['reveal'] => {
    return chapters[index]?.reveal;
  }, [chapters]);

  // Build the complete result with proper action implementations
  const completeResult: ScrollStoryResult<T> = {
    // State
    chapters,
    activeIndex,
    activeChapterId: activeIndex >= 0 ? chapters[activeIndex].id : null,
    scrollProgress: scrollProgress as number,
    scrollVelocity,
    reduced,
    chapterRefs: refsMap,
    revealStates: revealMap,

    // Actions
    scrollToChapter,
    scrollToChapterById,
    nextChapter: () => {
      if (activeIndex < chapters.length - 1) {
        scrollToChapter(activeIndex + 1);
      }
    },
    prevChapter: () => {
      if (activeIndex > 0) {
        scrollToChapter(activeIndex - 1);
      }
    },
    registerChapter: (_id: string, _ref: RefCallback<HTMLElement>) => {
      // External registration
    },
    unregisterChapter: (id: string) => {
      chapterObservations.current.delete(id);
      revealStates.current.delete(id);
    },

    // Helpers
    getChapterVariants,
    getChapterRevealConfig,
  };

  return completeResult;
}

/**
 * ScrollStoryProvider — React Context wrapper for ScrollStory.
 *
 * Use when multiple components need access to story state/actions without
 * prop drilling. The provider creates a single ScrollStory instance and
 * exposes it via context.
 */
import { createContext, useContext, type ReactNode } from 'react';

type ScrollStoryContextValue<T> = ScrollStoryResult<T>;

const ScrollStoryContext = createContext<ScrollStoryContextValue<unknown> | null>(null);

interface ScrollStoryProviderProps<T> {
  options: ScrollStoryOptions<T>;
  children: ReactNode;
}

export function ScrollStoryProvider<T = unknown>({ options, children }: ScrollStoryProviderProps<T>) {
  const story = useScrollStory(options);
  return (
    <ScrollStoryContext.Provider value={story as ScrollStoryContextValue<T>}>
      {children}
    </ScrollStoryContext.Provider>
  );
}

export function useScrollStoryContext<T = unknown>(): ScrollStoryContextValue<T> {
  const context = useContext(ScrollStoryContext);
  if (!context) {
    throw new Error('useScrollStoryContext must be used within a ScrollStoryProvider');
  }
  return context as ScrollStoryContextValue<T>;
}

/**
 * Convenience hook for chapter rail components.
 * Returns minimal data needed for a chapter navigation rail.
 */
export function useChapterRail<T = unknown>() {
  const { chapters, activeIndex, scrollToChapter, reduced } = useScrollStoryContext<T>();
  const scrollProgress = useScrollProgress();

  return {
    chapters,
    activeIndex,
    scrollProgress,
    reduced,
    scrollToChapter,
  };
}

/**
 * Convenience hook for components that need to sync with a specific chapter.
 * Returns intersection state + variants for the given chapter index.
 */
export function useChapterSync<T = unknown>(chapterIndex: number) {
  const { chapters, revealStates, getChapterVariants, activeIndex, scrollProgress, reduced } =
    useScrollStoryContext<T>();

  const chapter = chapters[chapterIndex];
  const state = chapter ? revealStates.get(chapter.id) : undefined;
  const variants = getChapterVariants(chapterIndex);

  return {
    chapter,
    isActive: activeIndex === chapterIndex,
    hasRevealed: state?.hasRevealed ?? false,
    isIntersecting: state?.isIntersecting ?? false,
    ratio: state?.ratio ?? 0,
    variants,
    scrollProgress,
    reduced,
  };
}

/**
 * Create a ChapterConfig with sensible defaults.
 * Helper for consistent chapter definitions.
 */
export function createChapterConfig<T>(
  id: string,
  label: string,
  overrides: Partial<ChapterConfig<T>> = {}
): ChapterConfig<T> {
  return {
    id,
    label,
    pinned: false,
    pinDistance: 1,
    reveal: {
      rootMargin: '-80px',
      threshold: 0,
      once: true,
      ...overrides.reveal,
    },
    ...overrides,
  };
}