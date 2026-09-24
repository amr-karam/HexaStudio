import type { MetadataRoute } from "next";

const BASE_URL = "https://hexastudio.net";

const staticRoutes = [
  "",
  "/about",
  "/blog",
  "/contact",
  "/projects",
  "/services",
  "/privacy",
  "/terms",
  "/login",
  "/ai",
  "/demo",
  "/flowdeck",
  "/photographer",
  "/studio",
  "/story",
];

const blogCategories = ["architecture", "visualization", "technology", "process", "culture"];

const projectCategories = ["residential", "commercial", "cultural", "hospitality", "masterplan"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticSitemap: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Add blog category pages
  const blogCategorySitemap: MetadataRoute.Sitemap = blogCategories.map((cat) => ({
    url: `${BASE_URL}/blog/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Add project category pages
  const projectCategorySitemap: MetadataRoute.Sitemap = projectCategories.map((cat) => ({
    url: `${BASE_URL}/projects/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic blog posts (when CMS is connected)
  // const blogPosts = await getBlogPosts();
  // const blogPostSitemap = blogPosts.map((post) => ({
  //   url: `${BASE_URL}/blog/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.6,
  // }));

  // Dynamic project pages (when CMS is connected)
  // const projects = await getProjects();
  // const projectSitemap = projects.map((project) => ({
  //   url: `${BASE_URL}/projects/${project.slug}`,
  //   lastModified: new Date(project.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.9,
  // }));

  return [
    ...staticSitemap,
    ...blogCategorySitemap,
    ...projectCategorySitemap,
    // ...blogPostSitemap,
    // ...projectSitemap,
  ];
}