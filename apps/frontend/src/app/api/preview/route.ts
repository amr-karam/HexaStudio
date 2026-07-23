import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const url = searchParams.get("url");
  const status = searchParams.get("status");

  // Authenticate the preview request
  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Enable or disable draft mode based on the content status
  const draft = await draftMode();
  if (status === "published") {
    draft.disable();
  } else {
    draft.enable();
  }

  // Redirect to the previewed content URL
  redirect(url || "/");
}
