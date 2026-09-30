/**
 * HyperFramesPlayer — React wrapper for HyperFrames compositions
 *
 * Loads a HyperFrames composition HTML file and provides
 * play/pause/seek controls. Integrates with the HEXA design
 * system and respects reduced-motion preferences.
 */

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface HyperFramesPlayerProps {
  /** Path to the composition HTML file */
  src: string
  /** Composition ID (must match data-composition-id in the HTML) */
  compositionId: string
  /** Width of the composition canvas */
  width?: number
  /** Height of the composition canvas */
  height?: number
  /** Autoplay on mount (default: true) */
  autoPlay?: boolean
  /** Additional CSS class for the wrapper */
  className?: string
}

export function HyperFramesPlayer({
  src,
  compositionId,
  width = 1920,
  height = 1080,
  autoPlay = true,
  className = '',
}: HyperFramesPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const reducedMotion = useReducedMotion()

  // Load composition and set up communication
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsReady(true)
      if (autoPlay && !reducedMotion) {
        iframe.contentWindow?.postMessage(
          { type: 'hyperframes:play', compositionId },
          '*',
        )
        setIsPlaying(true)
      }
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [compositionId, autoPlay, reducedMotion])

  // Listen for time updates from the composition
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'hyperframes:timeupdate') {
        setCurrentTime(event.data.time)
        setDuration(event.data.duration)
      }
      if (event.data?.type === 'hyperframes:ended') {
        setIsPlaying(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handlePlay = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'hyperframes:play', compositionId },
      '*',
    )
    setIsPlaying(true)
  }, [compositionId])

  const handlePause = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'hyperframes:pause', compositionId },
      '*',
    )
    setIsPlaying(false)
  }, [compositionId])

  const handleSeek = useCallback(
    (time: number) => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'hyperframes:seek', compositionId, time },
        '*',
      )
      setCurrentTime(time)
    },
    [compositionId],
  )

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-sl-silver/10 bg-sl-void ${className}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title="HyperFrames composition"
        className="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Controls overlay */}
      {isReady && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-gradient-to-t from-sl-void/90 to-transparent p-4">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-sl-gold-subtle/30 bg-sl-obsidian/60 text-sl-alabaster transition-colors hover:bg-sl-gold-subtle/10"
          >
            {isPlaying ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <input
            type="range"
            min={0}
            max={duration || 6}
            step={0.01}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            aria-label="Seek"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-sl-silver/20 accent-sl-gold-subtle"
          />

          <span className="min-w-[80px] text-right text-xs tabular-nums text-sl-mist/70">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
      )}

      {/* Loading state */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-sl-void">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sl-gold-subtle/30 border-t-sl-gold-subtle" />
        </div>
      )}
    </div>
  )
}
