import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore our curated collection of architectural visualization projects — from residential masterpieces to commercial landmarks.",
  openGraph: {
    title: "HexaStudio Projects — Architectural Visualization Portfolio",
    description:
      "Explore our curated collection of architectural visualization projects worldwide.",
    url: "https://hexastudio.net/projects",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/logo.svg",
        width: 1200,
        height: 630,
        alt: "HexaStudio Projects — Architectural Visualization Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HexaStudio Projects — Architectural Visualization Portfolio",
    description:
      "Explore our curated collection of architectural visualization projects worldwide.",
    images: ["https://hexastudio.net/logo.svg"],
  },
};
export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
