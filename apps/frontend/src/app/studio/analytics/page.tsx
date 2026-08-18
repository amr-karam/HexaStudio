"use client";

import { QualitySettingsPanel } from "@/features/monitoring/components/QualitySettingsPanel";
import { TelemetryDashboard } from "@/features/admin/components/TelemetryDashboard";
import { ContextLossTracker } from "@/features/monitoring/components/ContextLossTracker";
import { Card } from "@/components/ui/cards/Card";
import { useState } from "react";

export default function StudioAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "quality" | "telemetry">("overview");

  const badge = (variant: "secondary" | "destructive" | "outline", label: string) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    const styles = {
      secondary: "bg-muted text-muted-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-border text-muted-foreground",
    };
    return <span className={`${base} ${styles[variant]}`}>{label}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
        {/* Main Content Column */}
        <div className="flex-1 lg:w-2/3 space-y-6">
          <div className="border-b">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "overview" ? "bg-muted" : "hover:bg-muted"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("quality")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "quality" ? "bg-muted" : "hover:bg-muted"}`}
              >
                Quality Settings
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "telemetry" ? "bg-muted" : "hover:bg-muted"}`}
              >
                Telemetry
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <Card className="p-4">
                <h4 className="font-medium mb-2">WebGL Rendering Status</h4>
                <ContextLossTracker />
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    This dashboard provides real-time insights into the WebGL rendering system.
                    The adaptive rendering system automatically adjusts quality based on device
                    capabilities and current performance to ensure smooth user experience.
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    <span>GPU Memory Pressure: <span className="font-medium">Medium</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Frame Rate: <span className="font-medium">58 FPS</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Draw Calls: <span className="font-medium">1.2K / frame</span></span>
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "quality" && (
            <Card className="p-4">
              <h4 className="font-medium mb-2">Manual Quality Override</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Override the automatic quality detection to force a specific rendering quality level.
              </p>
              <QualitySettingsPanel />
            </Card>
          )}

          {activeTab === "telemetry" && (
            <Card className="p-4">
              <h4 className="font-medium mb-2">Detailed Telemetry</h4>
              <TelemetryDashboard />
            </Card>
          )}
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:w-1/3 space-y-4">
          <Card className="p-4">
            <h4 className="font-medium mb-2">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {badge("secondary", "Online")}
                <span className="flex-1 text-right text-sm">Last Updated</span>
                <span className="text-xs text-muted-foreground">2m ago</span>
              </div>
              <div className="flex items-center gap-2">
                {badge("destructive", "1 Active")}
                <span className="flex-1 text-right text-sm">WebGL Contexts</span>
                <span className="text-xs text-muted-foreground">1/3</span>
              </div>
              <div className="flex items-center gap-2">
                {badge("outline", "Adaptive")}
                <span className="flex-1 text-right text-sm">Rendering Mode</span>
                <span className="text-xs text-muted-foreground">Auto</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-4 py-2 border rounded hover:bg-muted">
                <span>Force Quality Reset</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-13.257-2m8.505 0V15M10 12l1-1m0 0l1-1m-1 1h11m-1 1l-1 1m0 0l-1 1m-1 1h-11" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border rounded hover:bg-muted">
                <span>Export Telemetry Data</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 border rounded hover:bg-muted">
                <span>Clear Loss History</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-medium mb-2">About Adaptive Rendering</h4>
            <p className="text-sm text-muted-foreground">
              The adaptive rendering system continuously monitors WebGL context health, GPU memory
              pressure, and frame rates to dynamically adjust rendering quality. This ensures
              optimal performance across a wide range of devices while maintaining visual fidelity
              where possible.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              <strong>Quality Tiers:</strong><br/>
              • <span className="font-medium">High</span>: Full effects, maximum triangle count<br/>
              • <span className="font-medium">Medium</span>: Reduced shadows, medium detail<br/>
              • <span className="font-medium">Low</span>: Basic rendering, minimal effects
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
