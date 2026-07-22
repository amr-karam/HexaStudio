import type { Metadata } from "next";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { HeaderSection } from "@/features/portfolio/components/HeaderSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";
export const dynamic = 'force-dynamic';
export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore our curated collection of architectural visualization projects — from residential masterpieces to commercial landmarks.",
  openGraph: {
    title: "Projects | HexaStudio",
    description:
      "Explore our curated collection of architectural visualization projects.",
  },
};
export default async function PortfolioPage() {
  const projectsData = await fetchProjects();
  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      {" "}
      <HeaderSection /> <ProjectGrid
        projects={projectsData.projects ?? []}
      />{" "}
    </main>
  );
}
