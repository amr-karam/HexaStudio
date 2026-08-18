import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/config/constants";

const TUNNEL_TOKEN_HEADER = "x-sentry-tunnel-token";

function isSameOrigin(value: string | null): boolean {
  if (!value) return true;
  try {
    return new URL(value).origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const sentryHost = process.env.SENTRY_HOST || process.env.NEXT_PUBLIC_SENTRY_HOST;
  const sentryProjectId = process.env.SENTRY_PROJECT_ID || process.env.NEXT_PUBLIC_SENTRY_PROJECT_ID;

  if (!sentryHost || !sentryProjectId) {
    // If not configured, gracefully accept and discard or return ok
    return NextResponse.json({ status: "skipped" }, { status: 200 });
  }

  const tunnelToken = process.env.SENTRY_TUNNEL_TOKEN;
  if (tunnelToken) {
    if (req.headers.get(TUNNEL_TOKEN_HEADER) !== tunnelToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (!isSameOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const envelope = await req.text();
    const upstream = `https://${sentryHost}/api/${sentryProjectId}/envelope/`;
    const upstreamRes = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/x-sentry-envelope" },
      body: envelope,
    });
    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
    });
  } catch (error) {
    console.error("Sentry tunnel failed", error);
    return NextResponse.json({ error: "Tunnel failed" }, { status: 500 });
  }
}