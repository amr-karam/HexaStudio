import { HomeChapterRail } from "@/features/portfolio/components/HomeChapterRail";
import { HomePageDynamic } from "@/features/portfolio/components/HomePageDynamic";
import { StudioSection } from "@/features/portfolio/components/StudioSection";
import { fetchProjects } from "@/features/portfolio/lib/fetchProjects";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { HomeHero } from "@/features/portfolio/components/HomeHero";
import type { Metadata } from "next";
import { generateOrganizationSchema } from "@hexastudio/utils";

/** ISR: 1h background refresh + on-demand via /api/revalidate (Sprint 15 P9).
    * Pages prerender at build (gracefully empty when backend is down); deploy
    * script pings /api/revalidate to fill with live content within seconds. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Premium Architecture Visualization | HexaStudio",
  description: "HexaStudio is a premium global architecture visualization and digital studio platform, specializing in world-class 3D/WebGL experiences and project storytelling.",
  alternates: {
    canonical: "https://hexastudio.net",
  },
};

/**
 * Homepage — Silent Luxury Design (Minimalist Premium Aesthetic)
 *
 * Design principles:
 * - Maximum whitespace, minimum ink
 * - Restrained micro-parallax (subtle tilt on hover)
 * - Hairline gold accents, revealed on interaction
 * - Cormorant Garamond for headlines (elegant serif)
 * - Jost for body (clean, geometric sans)
 * - Cinematic grain + vignette for depth
 * - Understated animations (slow, deliberate)
 */
export default async function HomePage() {
  let projectsData;
  try {
    projectsData = await fetchProjects();
  } catch (error) {
    // If fetch fails entirely, use empty data
    console.error("Failed to fetch projects for homepage:", error);
    projectsData = { projects: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  // Validate the response
  const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];
  const featuredProject = projects.length > 0 ? projects[0] : undefined;

  const jsonLd = generateOrganizationSchema();

  return (
    <div className="bg-sl-void">
      {/* Ambient grain overlay — whispers texture */}
      <div className="sl-grain" aria-hidden="true" />
      {/* Cinematic vignette — depth perception */}
      <div className="sl-vignette" aria-hidden="true" />
      {/* Subtle warm radial glow */}
      <div className="absolute inset-0 gradient-radial-gold opacity-20 pointer-events-none" aria-hidden="true" />

      {/* SEO — Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeChapterRail />
      <HomeHero />
      <GlobalErrorBoundary>
        <HomePageDynamic
          featuredProject={featuredProject}
          projects={projects}
        />
      </GlobalErrorBoundary>
      <StudioSection />
    </div>
  );
}
