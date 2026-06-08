import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getServiceSlugs } from "@/lib/legacy-html";
import { solutionSlugs } from "@/components/solution-details-data";
import { getAllPosts } from "@/lib/blog";

// Static lastModified — the build itself is the freshness signal; a fixed date keeps
// the sitemap deterministic across builds instead of churning every deploy.
const LAST_MODIFIED = new Date("2026-06-03");

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE.url}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency,
    priority,
  });

  const staticPages: MetadataRoute.Sitemap = [
    entry("/", 1.0, "weekly"),
    entry("/services", 0.9, "monthly"),
    entry("/solutions", 0.9, "monthly"),
    entry("/articles", 0.7, "weekly"),
    // The blog is intentionally absent from the on-site navigation, but it is listed here
    // so Google crawls and indexes it — that is what lets it contribute to SEO.
    entry("/blogs", 0.7, "weekly"),
    entry("/contact", 0.8, "monthly"),
    entry("/book", 0.8, "monthly"),
    entry("/careers", 0.6, "weekly"),
    entry("/life-at-techsara", 0.5, "monthly"),
    entry("/privacy-policy", 0.3, "yearly"),
    entry("/eula", 0.3, "yearly"),
  ];

  // /services/{talent,team,project,international}
  const servicePages = solutionSlugs.map((slug) =>
    entry(`/services/${slug}`, 0.8, "monthly"),
  );

  // /solutions/{generative-ai, computer-vision, ...}
  const solutionPages = getServiceSlugs().map((slug) =>
    entry(`/solutions/${slug}`, 0.8, "monthly"),
  );

  // /blogs/{slug} — each post stamped with its own publish/update date for freshness.
  const blogPages: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE.url}/blogs/${post.slug}`,
    lastModified: new Date(`${post.modifiedDate ?? post.publishedDate}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...solutionPages, ...blogPages];
}
