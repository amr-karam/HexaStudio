/**
 * apps/frontend/src/app/api/cost-estimate/route.ts
 * Next.js API Route — Cost Estimator proxy (POST /api/cost-estimate)
 * HEXA Studio — Sprint S022.4
 *
 * Proxies to NestJS backend: /api/v1/cost-estimate/calculate
 * Also handles PDF generation via /api/v1/cost-estimate/pdf
 */
import { NextRequest, NextResponse } from "next/server";

interface CostEstimateRequestBody {
  action?: string;
  payload?: unknown;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CostEstimateRequestBody;
    const action = body.action || "calculate";
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const endpoint =
      action === "pdf"
        ? "/api/v1/cost-estimate/pdf"
        : "/api/v1/cost-estimate/calculate";

    if (action === "pdf") {
      const resp = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body.payload),
      });

      if (!resp.ok) {
        return NextResponse.json(
          { error: "PDF generation failed" },
          { status: resp.status }
        );
      }

      const pdfBuffer = await resp.arrayBuffer();

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": resp.headers.get("Content-Disposition") || "inline",
        },
      });
    }

    const resp = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.payload),
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const resp = await fetch(`${backendUrl}/api/v1/cost-estimate/materials`);
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
