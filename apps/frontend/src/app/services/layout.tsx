import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Services",
  description:
    "HexaStudio offers architectural visualization, real-time 3D experiences, cinematic animation, and visual consulting services.",
  openGraph: {
    title: "Services | HexaStudio",
    description:
      "From photorealistic stills to interactive 3D walkthroughs — services born from curiosity.",
  },
};
export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
