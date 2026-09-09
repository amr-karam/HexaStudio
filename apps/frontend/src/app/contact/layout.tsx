import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with HexaStudio. Start your architectural visualization project today — we respond within 24 hours.",
  alternates: { canonical: "https://hexastudio.net/contact" },
  openGraph: {
    title: "Contact HexaStudio — Start a Conversation",
    description:
      "Let's create something extraordinary. Reach out to begin your architectural visualization project.",
    url: "https://hexastudio.net/contact",
    type: "website",
    images: [
      {
        url: "https://hexastudio.net/logo.svg",
        width: 1200,
        height: 630,
        alt: "Contact HexaStudio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact HexaStudio — Start a Conversation",
    description:
      "Let's create something extraordinary. Reach out to begin your architectural visualization project.",
    images: ["https://hexastudio.net/logo.svg"],
  },
};
export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
