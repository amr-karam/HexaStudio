import { ProjectGrid } from '@/features/portfolio/components/ProjectGrid';
import { HeaderSection } from '@/features/portfolio/components/HeaderSection';
import { fetchProjects } from '@/features/portfolio/lib/fetchProjects';

export const revalidate = 3600; // Revalidate every hour

export default async function PortfolioPage() {
  const projectsData = await fetchProjects();

  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <HeaderSection />
      <ProjectGrid projects={projectsData.projects ?? []} />
    </main>
  );
}
