import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const sentryHost = process.env.SENTRY_HOST || process.env.NEXT_PUBLIC_SENTRY_HOST;
  const sentryProjectId = process.env.SENTRY_PROJECT_ID || process.env.NEXT_PUBLIC_SENTRY_PROJECT_ID;

  if (!sentryHost || !sentryProjectId) {
    // If not configured, gracefully accept and discard or return ok
    return NextResponse.json({ status: "skipped" }, { status: 200 });
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
    return NextResponse.json({ error: "Tunnel failed", details: String(error) }, { status: 500 });
  }
}
