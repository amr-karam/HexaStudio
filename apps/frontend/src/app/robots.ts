import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://hexastudio.net";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/", "/_next/", "/static/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}