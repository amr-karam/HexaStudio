/**
 * apps/frontend/src/app/api/style-transfer/route.ts
 * Next.js API Route — Style Transfer proxy (POST /api/style-transfer)
 * HEXA Studio — Sprint S022.3
 *
 * Proxies to NestJS backend: /api/v1/style-transfer/generate
 * Self-hosted, local SD + ControlNet via AUTOMATIC1111 WebUI
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const resp = await fetch(
      `${backendUrl}/api/v1/style-transfer/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const resp = await fetch(
      `${backendUrl}/api/v1/style-transfer/materials`
    );

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
