import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "HexaStudio is a boutique architectural visualization studio blending technical precision with cinematic storytelling.",
  openGraph: {
    title: "About | HexaStudio",
    description:
      "Where architecture meets atmosphere — a boutique studio for architectural visualization.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
