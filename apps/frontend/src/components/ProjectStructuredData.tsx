import React from "react";
import { Project } from "@hexastudio/types";
interface ProjectStructuredDataProps {
  project: Project;
}
export function ProjectStructuredData({ project }: ProjectStructuredDataProps) {
  const baseUrl = "https://hexastudio.net";
  const imageUrl = project.coverImage
    ? `${project.coverImage}?w=1200&q=80`
    : `${baseUrl}/logo.svg`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription || project.description,
    image: imageUrl,
    url: `${baseUrl}/portfolio/${project.slug}`,
    author: { "@type": "Organization", name: "HexaStudio", url: baseUrl },
    keywords: project.category?.name,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    ...(project.location && { locationCreated: project.location }),
    ...(project.year && { copyrightYear: project.year }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
