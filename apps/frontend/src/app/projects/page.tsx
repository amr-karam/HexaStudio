import type { Metadata } from "next";
import { ProjectGrid } from "@/features/portfolio/components/ProjectGrid";
import { HeaderSection } from "@/features/portfolio/components/HeaderSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";

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

export default async function ProjectsPage() {
  const projectsData = await fetchProjects();

  // Validate the response data
  const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <HeaderSection />
      <ProjectGrid projects={projects} />
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-neutral-500 text-lg">No projects found.</p>
          <p className="text-neutral-400 text-sm mt-2">Check back soon for new work.</p>
        </div>
      )}
    </div>
  );
}
