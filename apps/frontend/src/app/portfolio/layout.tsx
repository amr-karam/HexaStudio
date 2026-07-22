import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Projects | HexaStudio",
  description: "Explore our architectural visualization projects.",
};
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
