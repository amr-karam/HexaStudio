import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "About",
  description:
    "Living Spaces. Visualized. A boutique architectural visualization studio creating immersive 3D experiences.",
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
