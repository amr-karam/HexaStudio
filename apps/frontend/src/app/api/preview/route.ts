import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const PREVIEW_PATH_PATTERN =
  /^\/(?:blog|projects)\/[a-z0-9-_]+$|^\/[a-z0-9-_]*$/;

function isSafePreviewTarget(value: string): boolean {
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  if (value.includes("\\")) return false;
  if (value.includes(":")) return false;
  return PREVIEW_PATH_PATTERN.test(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");
  const status = searchParams.get("status");

  // Authenticate the preview request
  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const target = url ?? "/";
  if (!isSafePreviewTarget(target)) {
    return NextResponse.json({ error: "Invalid redirect target" }, { status: 400 });
  }

  // Enable or disable draft mode based on the content status
  const draft = await draftMode();
  if (status === "published") {
    draft.disable();
  } else {
    draft.enable();
  }

  // Redirect to the previewed content URL
  redirect(target);
}