'use client';

import { useEffect, useRef, useState } from 'react';
import type { DesignSettings } from '@/lib/design-tokens';

interface LivePreviewIframeProps {
  previewUrl: string;
  designSettings: DesignSettings | null;
  onElementClick: (element: { tagName: string; styles: Record<string, string> } | null) => void;
}

export function LivePreviewIframe({ previewUrl, designSettings, onElementClick }: LivePreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync design settings to iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current || !designSettings) return;
    try {
      iframeRef.current.contentWindow?.postMessage(
        { type: 'hexastudio:designUpdate', settings: designSettings },
        '*'
      );
    } catch {
      // Cross-origin
    }
  }, [designSettings]);

  // Listen for element clicks inside iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'hexastudio:elementClick') {
        onElementClick(event.data.element);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementClick]);

  // Loading state
  useEffect(() => {
    if (!iframeRef.current) return;
    const handler = () => setIsLoading(false);
    iframeRef.current.addEventListener('load', handler);
    return () => iframeRef.current?.removeEventListener('load', handler);
  }, []);

  return (
    <div className="absolute inset-0 bg-sl-void">
      {previewUrl ? (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="Live Preview"
          className="w-full h-full border-none bg-transparent"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setIsLoading(false)}
          onClick={(e) => {
            // If user clicks inside iframe, try to get the clicked element
            const target = (e.target as HTMLElement).tagName;
            onElementClick({ tagName: target, styles: {} });
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-sl-glass-border flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sl-silver">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <p className="font-['JetBrains_Mono'] text-xs text-sl-silver uppercase tracking-widest">Preview Unavailable</p>
            <p className="text-xs text-sl-silver mt-1">Open a page in the preview frame</p>
          </div>
        </div>
      )}
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-sl-void/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="font-['JetBrains_Mono'] text-[10px] text-accent uppercase tracking-[0.2em]">Loading Preview</span>
          </div>
        </div>
      )}
    </div>
  );
}
