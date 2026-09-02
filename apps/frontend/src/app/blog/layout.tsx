import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on architectural visualization, 3D technology, spatial intelligence, and design by HexaStudio.",
  openGraph: {
    title: "HexaStudio Blog — Architectural Visualization Insights",
    description:
      "Insights on architectural visualization, 3D technology, and spatial design.",
    url: "https://hexastudio.net/blog",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "HexaStudio Blog — Architectural Visualization Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio Blog — Architectural Visualization Insights",
    description:
      "Insights on architectural visualization, 3D technology, and spatial design.",
    images: ["https://hexastudio.net/og-image.png"],
  },
};
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
