import { NextResponse } from 'next/server';

export async function GET() {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HEXA Studio — Executive Project Brief</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #050508; color: #f5f5f7; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-b: 1px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #d4af37; }
    .title { font-size: 28px; margin: 0 0 10px 0; color: #fff; }
    .meta { font-size: 12px; color: #888; margin-bottom: 30px; }
    .section { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .section-title { font-size: 16px; font-weight: bold; color: #d4af37; margin-top: 0; margin-bottom: 15px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .card { background: #1a1a1a; padding: 15px; border-radius: 8px; }
    .metric { font-size: 22px; font-weight: bold; color: #fff; margin-top: 5px; }
    .label { font-size: 11px; color: #888; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th { text-align: left; padding: 8px; border-bottom: 1px solid #333; color: #888; }
    td { padding: 10px 8px; border-bottom: 1px solid #222; }
    .status-ok { color: #4ade80; font-weight: bold; }
    @media print { body { background: #fff; color: #000; } .card, .section { background: #f9f9f9; border-color: #eee; } .logo, .section-title { color: #000; } .metric { color: #000; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HEXA STUDIO</div>
    <div style="text-align: right;">
      <div style="font-size: 14px; font-weight: bold;">Executive Project Brief</div>
      <div style="font-size: 11px; color: #888;">Generated: ${dateStr}</div>
    </div>
  </div>

  <h1 class="title">Villa Horizon — Architectural Masterplan</h1>
  <div class="meta">Client: Horizon Capital Real Estate | Project ID: PRJ-2026-089 | Odoo Synced: Yes</div>

  <div class="section">
    <div class="section-title">Executive Summary & Health Score</div>
    <div class="grid">
      <div class="card">
        <div class="label">Project Health Score</div>
        <div class="metric" style="color: #4ade80;">96 / 100</div>
      </div>
      <div class="card">
        <div class="label">Target Completion</div>
        <div class="metric">Nov 15, 2026</div>
      </div>
      <div class="card">
        <div class="label">Approved Milestones</div>
        <div class="metric">4 / 5 Phases</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Financial Status (Odoo Accounting Sync)</div>
    <table>
      <thead>
        <tr><th>Invoice ID</th><th>Milestone Description</th><th>Amount</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>INV-2026-001</td><td>Concept & Schematic Design</td><td>$45,000.00</td><td class="status-ok">Paid</td></tr>
        <tr><td>INV-2026-042</td><td>Spatial Modeling & Material Specs</td><td>$65,000.00</td><td class="status-ok">Paid</td></tr>
        <tr><td>INV-2026-089</td><td>Real-Time Raytracing & 4K Cinema</td><td>$35,000.00</td><td style="color: #fbbf24;">Pending Review</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Active Deliverables & 3D Assets</div>
    <table>
      <thead>
        <tr><th>Deliverable</th><th>Format</th><th>Resolution</th><th>Sign-off Status</th></tr>
      </thead>
      <tbody>
        <tr><td>Exterior Architectural Masterplan</td><td>Interactive 3D / R3F</td><td>Real-time WebGL</td><td class="status-ok">Approved</td></tr>
        <tr><td>Interior Penthouse Raytraced Sequence</td><td>ProRes 4444 Video</td><td>4K (3840x2160)</td><td class="status-ok">Approved</td></tr>
        <tr><td>Landscape Lighting Masterplan</td><td>BIM / IFC Model</td><td>Vector LOD 400</td><td style="color: #fbbf24;">In Progress</td></tr>
      </tbody>
    </table>
  </div>

  <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #666;">
    HEXA Studio Architecture & Spatial Technology Ecosystem — Single Source of Truth via Odoo ERP
  </div>

  <script>
    // Trigger print automatically on page load for PDF saving
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>
  `;

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store',
    },
  });
}
