'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { DeferScript } from '../defer-script';

interface DeferredSceneLoaderProps {
  scene: ReactNode;
  placeholder?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  priority?: boolean;
}

/**
 * DeferredSceneLoader - Optimized 3D scene loading with intersection observer
 * 
 * Features:
 * - Loads 3D scenes only when they enter viewport
 * - Delays loading to reduce initial TBT
 * - Provides placeholder during loading
 * - Supports priority loading for critical scenes
 */
export function DeferredSceneLoader({
  scene,
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
  delay = 100,
  priority = false
}: DeferredSceneLoaderProps) {
  const [isVisible, setIsVisible] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay scene load for better TBT
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, delay, priority]);

  // Use DeferScript for non-priority scenes to reduce TBT
  const SceneContent = priority ? scene : (
    <DeferScript strategy="idle" timeout={2000}>
      {scene}
    </DeferScript>
  );

  return (
    <div 
      ref={ref} 
      style={{ 
        minHeight: '400px',
        position: 'relative'
      }}
    >
      {isVisible ? (
        SceneContent
      ) : (
        placeholder || <ScenePlaceholder />
      )}
    </div>
  );
}

/**
 * Default placeholder for 3D scenes
 */
function ScenePlaceholder() {
  return (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading 3D scene...
        </p>
      </div>
    </div>
  );
}

/**
 * Hook for programmatic deferred scene loading
 */
export function useDeferredSceneLoading(
  options: {
    threshold?: number;
    rootMargin?: string;
    delay?: number;
  } = {}
) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { threshold = 0.1, rootMargin = '100px', delay = 100 } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, delay]);

  return { ref, isVisible, isIntersecting };
}

/**
 * Optimized 3D canvas component with performance monitoring
 */
export function OptimizedCanvas({ 
  children, 
  onPerformanceIssue 
}: { 
  children: ReactNode;
  onPerformanceIssue?: (fps: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        fpsRef.current = fps;

        // Alert on performance issues
        if (fps < 30 && onPerformanceIssue) {
          onPerformanceIssue(fps);
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onPerformanceIssue]);

  return (
    <canvas 
      ref={canvasRef}
      style={{ 
        width: '100%', 
        height: '100%',
        touchAction: 'none' // Optimize touch interactions
      }}
    >
      {children}
    </canvas>
  );
}

/**
 * Progressive 3D model loader with quality levels
 */
export function ProgressiveModelLoader({
  lowQualityUrl,
  highQualityUrl,
  onLoad,
  children
}: {
  lowQualityUrl: string;
  highQualityUrl: string;
  onLoad?: (quality: 'low' | 'high') => void;
  children: (modelUrl: string, quality: 'low' | 'high') => ReactNode;
}) {
  const [currentQuality, setCurrentQuality] = useState<'low' | 'high'>('low');
  const [currentUrl, setCurrentUrl] = useState(lowQualityUrl);

  useEffect(() => {
    // Load low quality first
    setCurrentUrl(lowQualityUrl);
    setCurrentQuality('low');
    onLoad?.('low');

    // Then upgrade to high quality when idle
    const requestIdleCallback = 
      window.requestIdleCallback || 
      ((cb: IdleRequestCallback) => setTimeout(cb, 1000));

    const idleId = requestIdleCallback(() => {
      setCurrentUrl(highQualityUrl);
      setCurrentQuality('high');
      onLoad?.('high');
    }, { timeout: 3000 });

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, [lowQualityUrl, highQualityUrl, onLoad]);

  return <>{children(currentUrl, currentQuality)}</>;
}
