"use client";

import { useEffect, useState } from "react";
import { useWebGLContext } from "@/engine/webgl/WebGLContextProvider";
import { Card } from "@/components/ui/cards/Card";
import { Button } from "@/components/ui/Button";

/**
 * ContextLossTracker — Tracks and displays WebGL context loss events.
 * 
 * Persists loss events in localStorage for session continuity,
 * and provides a summary view with timestamps and recovery status.
 */
export function ContextLossTracker() {
  const { state, requestRecovery } = useWebGLContext();
  const [lossEvents, setLossEvents] = useState<Array<{
    timestamp: Date;
    state: string;
    recovered: boolean;
  }>>([]);
  const [isAttemptingRecovery, setIsAttemptingRecovery] = useState(false);
  
  // Initialize from localStorage or create empty array
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("webgl_loss_events") : null;
    if (stored) {
      setLossEvents(JSON.parse(stored));
    }
  }, []);
  
  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem("webgl_loss_events", JSON.stringify(lossEvents));
    } catch {
      // Ignore localStorage errors
    }
  }, [lossEvents]);
  
  // Track context loss events
  useEffect(() => {
    if (state === "lost" || state === "recovering" || state === "fallback") {
      setIsAttemptingRecovery(true);
      
      // Add event to history
      setLossEvents(prev => {
        const newEvent = {
          timestamp: new Date(),
          state,
          recovered: false,
        };
        // Keep only last 10 events
        const updated = [newEvent, ...prev.filter(e => e.timestamp.getTime() < Date.now() - 24 * 60 * 60 * 1000)];
        return updated.slice(0, 10);
      });
    }
  }, [state]);
  
  // Mark recovery attempts
  useEffect(() => {
    if (state === "ready" || state === "recovering") {
      setLossEvents(prev => prev.map(e =>
        e.timestamp.getTime() === new Date(lossEvents[0]?.timestamp || Date.now()).getTime()
          ? { ...e, recovered: true }
          : e
      ));
    }
  }, [state]);
  
  // Auto-attempt recovery after loss
  useEffect(() => {
    if (state === "lost") {
      const timer = setTimeout(() => {
        setIsAttemptingRecovery(true);
        requestRecovery().then(success => {
          setIsAttemptingRecovery(false);
          // Mark as recovered in history
          setLossEvents(prev => prev.map(e =>
            e.timestamp.getTime() >= new Date().getTime() - 5000
              ? { ...e, recovered: success }
              : e
          ));
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state, requestRecovery]);
  
  // Format timestamp helper
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000) return "just now";
    if (diff < 60 * 1000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
  };
  
  return (
    <Card className="p-4 space-y-3 max-w-lg">
      <h4 className="font-medium text-sm">Context Loss Tracker</h4>
      
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 text-xs rounded ${state === "lost" ? "bg-red-100 text-red-800" : state === "recovering" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{state}</span>
        <span className="text-xs text-muted-foreground capitalize">{formatTimestamp(new Date())}</span>
      </div>
      
      {lossEvents.length > 0 && (
        <div className="space-y-1 text-xs text-muted-foreground">
          {lossEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${event.recovered ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-muted-foreground">
                {formatTimestamp(event.timestamp)} - {event.recovered ? "✓ recovered" : "× failed"}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {isAttemptingRecovery && (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Attempting recovery...</span>
        </div>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => requestRecovery().then(() => setLossEvents(prev => prev.map(e => ({ ...e, recovered: true }))))}
        className="w-full"
        disabled={state !== "lost"}
      >
        Attempt Manual Recovery
      </Button>
    </Card>
  );
}
