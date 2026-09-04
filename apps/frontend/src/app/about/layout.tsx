import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About",
  description:
    "We are a multidisciplinary studio specializing in the intersection of architecture and digital art. Our mission is to create photorealistic environments that transcend traditional rendering.",
  openGraph: {
    title: "About HexaStudio — The Manifesto of Light",
    description:
      "A boutique architectural visualization studio where architecture meets atmosphere. Learn about our vision, precision, and craft.",
    url: "https://hexastudio.net/about",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/logo.svg",
        width: 1200,
        height: 630,
        alt: "HexaStudio — About the Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About HexaStudio — The Manifesto of Light",
    description:
      "A boutique architectural visualization studio where architecture meets atmosphere.",
    images: ["https://hexastudio.net/logo.svg"],
  },
};
export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
