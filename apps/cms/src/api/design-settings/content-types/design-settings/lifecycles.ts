/**
 * design-settings lifecycles
 * HEXA Studio — Hexa Command Centre
 */
const REVALIDATE_TIMEOUT_MS = 10_000;
const REVALIDATED_TAG = "design";

interface DesignRevalidateBody {
  paths: string[];
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
    tags: [REVALIDATED_TAG],
  };

  try {
    const res = await fetch(`${frontendUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ ...body, type: "layout" }),
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
  async afterDelete() {
    await triggerDesignRevalidation("delete");
  },
};
