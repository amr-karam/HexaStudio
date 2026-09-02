import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Services",
  description:
    "HexaStudio offers architectural visualization, real-time 3D experiences, cinematic animation, and visual consulting services for architects and developers.",
  openGraph: {
    title: "HexaStudio Services — Architectural Visualization",
    description:
      "From photorealistic stills to interactive 3D walkthroughs — services born from curiosity and precision.",
    url: "https://hexastudio.net/services",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/og-image.png",
        width: 1200,
        height: 630,
        alt: "HexaStudio Services — Architectural Visualization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio Services — Architectural Visualization",
    description:
      "From photorealistic stills to interactive 3D walkthroughs — services born from curiosity.",
    images: ["https://hexastudio.net/og-image.png"],
  },
};
export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
