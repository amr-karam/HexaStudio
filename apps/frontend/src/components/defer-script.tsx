'use client';

import { useEffect, useState } from 'react';

interface DeferScriptProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
  strategy?: 'idle' | 'timeout' | 'interaction';
}

/**
 * DeferScript - Component for deferring non-critical JavaScript execution
 * 
 * Strategies:
 * - 'idle': Load during browser idle time (default)
 * - 'timeout': Load after specified timeout
 * - 'interaction': Load after first user interaction
 */
export function DeferScript({
  children,
  fallback = null,
  timeout = 2000,
  strategy = 'idle'
}: DeferScriptProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    switch (strategy) {
      case 'idle': {
        const requestIdleCallback = 
          window.requestIdleCallback || 
          ((cb: IdleRequestCallback) => setTimeout(cb, 1));
        
        const idleId = requestIdleCallback(
          () => setReady(true),
          { timeout }
        );
        
        cleanup = () => {
          if (window.cancelIdleCallback) {
            window.cancelIdleCallback(idleId);
          } else {
            clearTimeout(idleId);
          }
        };
        break;
      }

      case 'timeout': {
        const timeoutId = setTimeout(() => setReady(true), timeout);
        cleanup = () => clearTimeout(timeoutId);
        break;
      }

      case 'interaction': {
        const handleInteraction = () => {
          setReady(true);
          cleanup?.();
        };

        const events = ['click', 'touchstart', 'keydown', 'scroll'];
        events.forEach(event => {
          window.addEventListener(event, handleInteraction, { once: true, passive: true });
        });

        // Fallback timeout
        const fallbackTimeout = setTimeout(() => {
          setReady(true);
          cleanup?.();
        }, timeout);

        cleanup = () => {
          events.forEach(event => {
            window.removeEventListener(event, handleInteraction);
          });
          clearTimeout(fallbackTimeout);
        };
        break;
      }
    }

    return cleanup;
  }, [strategy, timeout]);

  return ready ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component for deferring component loading
 */
export function withDefer<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<DeferScriptProps, 'children'> = {}
) {
  return function DeferredComponent(props: P) {
    return (
      <DeferScript {...options}>
        <Component {...props} />
      </DeferScript>
    );
  };
}

/**
 * Hook for programmatic deferred execution
 */
export function useDeferredExecution(
  callback: () => void,
  strategy: DeferScriptProps['strategy'] = 'idle',
  timeout = 2000
) {
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (executed) return;

    let cleanup: (() => void) | undefined;

    switch (strategy) {
      case 'idle': {
        const requestIdleCallback = 
          window.requestIdleCallback || 
          ((cb: IdleRequestCallback) => setTimeout(cb, 1));
        
        const idleId = requestIdleCallback(
          () => {
            callback();
            setExecuted(true);
          },
          { timeout }
        );
        
        cleanup = () => {
          if (window.cancelIdleCallback) {
            window.cancelIdleCallback(idleId);
          } else {
            clearTimeout(idleId);
          }
        };
        break;
      }

      case 'timeout': {
        const timeoutId = setTimeout(() => {
          callback();
          setExecuted(true);
        }, timeout);
        cleanup = () => clearTimeout(timeoutId);
        break;
      }

      case 'interaction': {
        const handleInteraction = () => {
          callback();
          setExecuted(true);
          cleanup?.();
        };

        const events = ['click', 'touchstart', 'keydown', 'scroll'];
        events.forEach(event => {
          window.addEventListener(event, handleInteraction, { once: true, passive: true });
        });

        const fallbackTimeout = setTimeout(() => {
          callback();
          setExecuted(true);
          cleanup?.();
        }, timeout);

        cleanup = () => {
          events.forEach(event => {
            window.removeEventListener(event, handleInteraction);
          });
          clearTimeout(fallbackTimeout);
        };
        break;
      }
    }

    return cleanup;
  }, [callback, strategy, timeout, executed]);

  return executed;
}
