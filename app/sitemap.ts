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
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/onboarding", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

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

  // Blog posts
  for (const locale of locales) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      const url =
        locale === "fr"
          ? `${BASE_URL}/blog/${post.slug}`
          : `${BASE_URL}/${locale}/blog/${post.slug}`;

      const alternates: Record<string, string> = {};
      alternates[locale] = url;

      if (post.translationSlug) {
        const otherLocale = locale === "fr" ? "en" : "fr";
        alternates[otherLocale] =
          otherLocale === "fr"
            ? `${BASE_URL}/blog/${post.translationSlug}`
            : `${BASE_URL}/${otherLocale}/blog/${post.translationSlug}`;
      }

      entries.push({
        url,
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: alternates },
      });
    }
  }

  return entries;
}
