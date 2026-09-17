/**
 * design-settings lifecycles
 * HEXA Studio — Hexa Command Centre
 *
 * Design tokens are global: any create / update / publish / unpublish /
 * delete of the Design Settings single type purges the Next.js ISR cache
 * (whole-site layout + `design` tag) so the new tokens go live immediately
 * instead of waiting for the 60s `fetchDesignSettings` refresh cycle.
 *
 * Contract (mirrors backend `strapi-project-sync.service.ts#revalidateFrontend`):
 *   POST {CLIENT_URL}/api/revalidate
 *   headers: { "x-revalidate-secret": REVALIDATE_SECRET }
 *   body:    { paths: ["/"], type: "layout", tags: ["design"] }
 *
 * Revalidation is best-effort and never fails the CMS write: failures only
 * emit a warning, and the ISR cache self-heals on the next refresh cycle.
 */

const REVALIDATE_TIMEOUT_MS = 10_000;
const REVALIDATED_TAG = "design";

interface DesignRevalidateBody {
  paths: string[];
  type: "page" | "layout";
  tags: string[];
}

async function triggerDesignRevalidation(reason: string): Promise<void> {
  const frontendUrl = process.env.CLIENT_URL || "https://hexastudio.net";
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.warn(
      `[design-settings] REVALIDATE_SECRET not configured — skipping ISR purge after ${reason}`
    );
    return;
  }

  const body: DesignRevalidateBody = {
    paths: ["/"],
    type: "layout",
    tags: [REVALIDATED_TAG],
  };

  try {
    const res = await fetch(`${frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REVALIDATE_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(
        `[design-settings] ISR purge failed after ${reason}: HTTP ${res.status}`
      );
      return;
    }

    console.info(
      `[design-settings] Next.js ISR cache purged after ${reason} (tag: ${REVALIDATED_TAG})`
    );
  } catch (err) {
    console.warn(
      `[design-settings] ISR purge failed after ${reason}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export default {
  async afterCreate() {
    await triggerDesignRevalidation("create");
  },
  async afterUpdate() {
    await triggerDesignRevalidation("update");
  },
  async afterPublish() {
    await triggerDesignRevalidation("publish");
  },
  async afterUnpublish() {
    await triggerDesignRevalidation("unpublish");
  },
  async afterDelete() {
    await triggerDesignRevalidation("delete");
  },
};
