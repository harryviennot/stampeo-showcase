import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://stampeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en"];
  const now = new Date().toISOString();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/onboarding", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Blog index — French only
  entries.push({
    url: `${BASE_URL}/blog`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // Static pages with i18n alternates
  for (const page of staticPages) {
    for (const locale of locales) {
      const url =
        locale === "fr"
          ? `${BASE_URL}${page.path}`
          : `${BASE_URL}/${locale}${page.path}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            fr: `${BASE_URL}${page.path}`,
            en: `${BASE_URL}/en${page.path}`,
          },
        },
      });
    }
  }

  // Blog posts — French only
  const posts = getAllPosts("fr");
  for (const post of posts) {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
