/**
 * apps/frontend/src/app/api/assets/models/route.ts
 * Next.js API Route — 3D Asset Marketplace proxy (GET /api/assets/models)
 * HEXA Studio — Sprint S022.5
 *
 * Proxies to NestJS backend: /api/v1/assets/models
 * Self-hosted, offline, no cloud/SaaS.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const resp = await fetch(`${backendUrl}/api/v1/assets/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
