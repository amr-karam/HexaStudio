import type { Metadata } from "next";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { HeaderSection } from "@/features/portfolio/components/HeaderSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

export const revalidate = 3600;
export const dynamic = 'force-dynamic';
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

export default async function ProjectsPage() {
  const projectsData = await fetchProjects();

  // Validate the response data
  const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];

  return (
    <div className="min-h-screen bg-sl-void pt-24 pb-20 md:pt-32 md:pb-24">
      <HeaderSection />
      <ProjectGrid projects={projects} />
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sl-mist/60 text-lg">No projects found.</p>
          <p className="text-sl-mist/60 text-sm mt-2">Check back soon for new work.</p>
        </div>
      )}
    </div>
  );
}
