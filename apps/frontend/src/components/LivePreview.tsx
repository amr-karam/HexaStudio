"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Strapi Live Preview listener.
 *
 * Mount this component in the root layout. It listens for messages from the
 * Strapi admin panel (when content is previewed in an iframe) and triggers
 * a full page refresh so the latest draft content is displayed.
 *
 * Also injects the Strapi Live Preview script when received, which enables
 * the "double-click to edit" functionality in the preview pane.
 */
export function LivePreview() {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { origin, data } = event;

      // Only accept messages from the Strapi admin origin
      if (origin !== process.env.NEXT_PUBLIC_CMS_URL && origin !== "http://localhost:1337") {
        return;
      }

      if (data.type === "strapiUpdate") {
        // Content was updated in Strapi — refresh the preview
        router.refresh();
      } else if (data.type === "strapiScript") {
        // Strapi is sending the Live Preview helper script
        const script = document.createElement("script");
        script.textContent = data.payload.script;
        document.head.appendChild(script);
      }
    };

    window.addEventListener("message", handleMessage);

    // Signal to Strapi that the frontend is ready to receive preview messages
    window.parent?.postMessage({ type: "previewReady" }, "*");

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return null;
}
